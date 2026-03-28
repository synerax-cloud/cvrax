# Enable required GCP APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "sql-component.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "vpcaccess.googleapis.com",
    "servicenetworking.googleapis.com",
    "compute.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "artifactregistry.googleapis.com",
  ])
  
  service            = each.value
  disable_on_destroy = false
}

# Random suffix for unique resource names
resource "random_id" "db_suffix" {
  byte_length = 4
}

# Random database password
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# VPC Network for private services
resource "google_compute_network" "vpc" {
  name                    = "${var.service_name}-vpc"
  auto_create_subnetworks = false
  
  depends_on = [google_project_service.required_apis]
}

# VPC Access Connector (for Cloud Run to Cloud SQL)
# Note: Connector creates its own subnet automatically
resource "google_vpc_access_connector" "connector" {
  name          = "${var.service_name}-vpc-connector"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.100.0.0/28"
  
  depends_on = [google_project_service.required_apis]
}

# Cloud SQL Instance (PostgreSQL)
resource "google_sql_database_instance" "postgres" {
  name             = "${var.service_name}-db-${random_id.db_suffix.hex}"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier              = var.database_tier
    availability_type = "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = 10
    
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = false
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 7
      }
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
    
    maintenance_window {
      day          = 7 # Sunday
      hour         = 3
      update_track = "stable"
    }
  }
  
  deletion_protection = true
  
  depends_on = [
    google_project_service.required_apis,
    google_service_networking_connection.private_vpc_connection
  ]
}

# Private VPC Connection for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.service_name}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Cloud SQL Database
resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.postgres.name
}

# Cloud SQL User
resource "google_sql_user" "db_user" {
  name     = "${var.service_name}_user"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

# Secret Manager Secrets
resource "google_secret_manager_secret" "database_url" {
  secret_id = "DATABASE_URL"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.db_user.name}:${random_password.db_password.result}@/${var.database_name}?host=/cloudsql/${google_sql_database_instance.postgres.connection_name}"
}

resource "google_secret_manager_secret" "nextauth_secret" {
  secret_id = "NEXTAUTH_SECRET"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "nextauth_secret" {
  secret      = google_secret_manager_secret.nextauth_secret.id
  secret_data = var.nextauth_secret
}

resource "google_secret_manager_secret" "google_client_id" {
  secret_id = "GOOGLE_CLIENT_ID"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "google_client_id" {
  secret      = google_secret_manager_secret.google_client_id.id
  secret_data = var.google_client_id
}

resource "google_secret_manager_secret" "google_client_secret" {
  secret_id = "GOOGLE_CLIENT_SECRET"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "google_client_secret" {
  secret      = google_secret_manager_secret.google_client_secret.id
  secret_data = var.google_client_secret
}

# Service Account for Cloud Run
resource "google_service_account" "cloudrun_sa" {
  account_id   = "${var.service_name}-cloudrun-sa"
  display_name = "Cloud Run Service Account for ${var.service_name}"
}

# IAM: Cloud Run SA can access Cloud SQL
resource "google_project_iam_member" "cloudrun_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# IAM: Cloud Run SA can access secrets
resource "google_secret_manager_secret_iam_member" "database_url_access" {
  secret_id = google_secret_manager_secret.database_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "nextauth_secret_access" {
  secret_id = google_secret_manager_secret.nextauth_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "google_client_id_access" {
  secret_id = google_secret_manager_secret.google_client_id.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "google_client_secret_access" {
  secret_id = google_secret_manager_secret.google_client_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = var.service_name
  description   = "Docker repository for ${var.service_name}"
  format        = "DOCKER"
  
  depends_on = [google_project_service.required_apis]
}

# Note: Cloud Run service is deployed by GitHub Actions workflow
# using gcloud run deploy after building the Docker image.
# This avoids the chicken-and-egg problem of needing the image
# before the service can be created.

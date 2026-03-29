output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = format("%s-docker.pkg.dev/%s/%s", var.region, var.project_id, var.service_name)
}

output "service_name" {
  description = "Cloud Run service name"
  value       = var.service_name
}

output "region" {
  description = "GCP region"
  value       = var.region
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.postgres.name
}

output "database_private_ip" {
  description = "Cloud SQL private IP address"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "vpc_connector_name" {
  description = "VPC Access Connector name"
  value       = google_vpc_access_connector.connector.name
}

output "service_account_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloudrun_sa.email
}

output "database_url_secret_name" {
  description = "Secret Manager secret name for DATABASE_URL"
  value       = google_secret_manager_secret.database_url.secret_id
}

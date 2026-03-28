variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "cvrax"
}

variable "database_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro" # Free tier eligible
}

variable "database_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "cvrax"
}

variable "min_instances" {
  description = "Minimum Cloud Run instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum Cloud Run instances"
  type        = number
  default     = 10
}

variable "container_memory" {
  description = "Container memory allocation"
  type        = string
  default     = "512Mi"
}

variable "container_cpu" {
  description = "Container CPU allocation"
  type        = string
  default     = "1"
}

variable "nextauth_secret" {
  description = "NextAuth secret key"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Custom domain name (optional)"
  type        = string
  default     = ""
}

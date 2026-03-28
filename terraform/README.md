# Terraform Infrastructure for CVRAX

This directory contains Terraform configuration for deploying CVRAX to Google Cloud Platform.

## Resources Created

- **Cloud Run**: Serverless container hosting
- **Cloud SQL**: PostgreSQL database (private IP)
- **VPC Network**: Private networking for Cloud SQL
- **VPC Connector**: Connects Cloud Run to private Cloud SQL
- **Secret Manager**: Secure storage for sensitive data
- **Artifact Registry**: Docker image repository
- **Service Account**: Cloud Run service identity with IAM roles

## Prerequisites

1. **GCP Project** with billing enabled
2. **Terraform** >= 1.0 installed
3. **gcloud CLI** installed and authenticated
4. **GCS Bucket** for Terraform state:
   ```bash
   gsutil mb gs://cvrax-terraform-state
   gsutil versioning set on gs://cvrax-terraform-state
   ```

## Setup

### 1. Configure Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:
- `project_id`: Your GCP project ID
- `nextauth_secret`: Generate with `openssl rand -base64 32`
- `google_client_id` & `google_client_secret`: From Google Cloud Console OAuth

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Plan Infrastructure

```bash
terraform plan
```

Review the resources that will be created.

### 4. Apply Infrastructure

```bash
terraform apply
```

Type `yes` to confirm. This will:
- Enable required GCP APIs (~2-3 min)
- Create VPC network and subnet (~1 min)
- Create Cloud SQL instance (~10-15 min)
- Set up Secret Manager secrets (~1 min)
- Create Cloud Run service (~2 min)
- Configure IAM permissions (~1 min)

**Total time: ~15-20 minutes**

### 5. Get Outputs

```bash
terraform output
```

Important outputs:
- `cloud_run_url`: Your application URL
- `database_connection_name`: For Cloud SQL connections
- `artifact_registry_url`: Docker image repository

## Cost Estimate

With free tier and default settings:

- **Cloud Run**: Free tier includes 2M requests/month, 360K GB-seconds
- **Cloud SQL (db-f1-micro)**: ~$7-15/month
- **VPC Connector**: ~$9/month (always on)
- **Secret Manager**: First 6 secrets free, then $0.06/secret/month
- **Artifact Registry**: 0.5 GB free, then $0.10/GB/month

**Estimated total: $16-25/month**

To reduce costs further:
- Use Cloud SQL proxy instead of VPC connector (saves ~$9/month)
- Set `min_instances = 0` (cold starts vs always-on)

## Infrastructure Management

### Update Resources

```bash
terraform plan
terraform apply
```

### Destroy Infrastructure

```bash
terraform destroy
```

⚠️ **WARNING**: This will delete your database and all data!

To preserve data:
1. Export database first: `gcloud sql export sql`
2. Remove deletion protection: Edit `resources.tf`, set `deletion_protection = false`
3. Run `terraform apply` then `terraform destroy`

## Secrets Management

Secrets are stored in GCP Secret Manager:

```bash
# View secrets
gcloud secrets list

# Update a secret
gcloud secrets versions add NEXTAUTH_SECRET --data-file=-
# Type secret value, press Ctrl+D

# View secret value (requires IAM permission)
gcloud secrets versions access latest --secret="NEXTAUTH_SECRET"
```

## Troubleshooting

### API Not Enabled Error

Wait 2-3 minutes after `terraform apply` for APIs to propagate.

### Cloud SQL Creation Timeout

Cloud SQL takes 10-15 minutes. If it times out, run `terraform apply` again.

### VPC Connector Quota

Default quota is 1-3 connectors per region. Request increase if needed:
https://console.cloud.google.com/iam-admin/quotas

### Permission Denied

Ensure your GCP account has these roles:
- Compute Network Admin
- Cloud SQL Admin
- Cloud Run Admin
- Secret Manager Admin
- Service Account Admin
- Service Usage Admin

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/deploy-gcp.yml`) will:
1. Run Terraform to ensure infrastructure exists
2. Build and push Docker image to Artifact Registry
3. Deploy new revision to Cloud Run

## Manual Deployment

If not using GitHub Actions:

```bash
# Build and push image
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/cvrax/cvrax:latest

# Deploy to Cloud Run
gcloud run deploy cvrax \
  --image REGION-docker.pkg.dev/PROJECT_ID/cvrax/cvrax:latest \
  --region us-central1
```

## Monitoring

- **Cloud Run**: https://console.cloud.google.com/run
- **Cloud SQL**: https://console.cloud.google.com/sql
- **Logs**: https://console.cloud.google.com/logs
- **Metrics**: https://console.cloud.google.com/monitoring

## Security Best Practices

✅ Database uses private IP (not public)
✅ Secrets stored in Secret Manager (not environment variables)
✅ Service account with minimal IAM roles
✅ VPC connector for secure Cloud SQL access
✅ Automatic backups enabled

## Support

For issues:
- Terraform: https://www.terraform.io/docs
- GCP: https://cloud.google.com/docs
- Cloud Run: https://cloud.google.com/run/docs

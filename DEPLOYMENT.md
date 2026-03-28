# CVRAX Deployment Guide

Complete guide for deploying CVRAX to Google Cloud Platform with automated CI/CD.

## Architecture Overview

```
GitHub Repository
    ↓
GitHub Actions (CI/CD)
    ↓
Terraform (Infrastructure)
    ├─→ Cloud SQL (PostgreSQL)
    ├─→ VPC Network + Connector
    ├─→ Secret Manager
    ├─→ Artifact Registry
    └─→ Cloud Run
```

## Prerequisites

### 1. GCP Account & Project

1. Create GCP account: https://console.cloud.google.com
2. Create new project or use existing
3. Enable billing for the project
4. Note your **Project ID**

### 2. Required API Enablement

Enable these APIs in GCP Console:
- Cloud Run API
- Cloud SQL Admin API
- Secret Manager API
- VPC Access API
- Service Networking API
- Compute Engine API
- Artifact Registry API

Or run:
```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  compute.googleapis.com \
  artifactregistry.googleapis.com
```

### 3. Service Account for GitHub Actions

```bash
# Set project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# Grant required roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.networkAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# Copy the contents of github-actions-key.json for GitHub Secrets
cat github-actions-key.json
```

### 4. Terraform State Bucket

```bash
# Create bucket for Terraform state
gsutil mb -p $PROJECT_ID gs://cvrax-terraform-state

# Enable versioning
gsutil versioning set on gs://cvrax-terraform-state
```

### 5. Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://YOUR-CLOUD-RUN-URL/api/auth/callback/google` (production)
3. Copy **Client ID** and **Client Secret**

## GitHub Repository Setup

### 1. Push Code to GitHub

```bash
cd cvrax
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/synerax-cloud/cvrax.git
git push -u origin main
```

### 2. Configure GitHub Secrets

Go to: `https://github.com/synerax-cloud/cvrax/settings/secrets/actions`

Add these secrets:

| Secret Name | Value | How to Get |
|------------|-------|------------|
| `GCP_PROJECT_ID` | Your project ID | GCP Console → Project Info |
| `GCP_SA_KEY` | Service account JSON | Contents of `github-actions-key.json` |
| `NEXTAUTH_SECRET` | Random string | Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Google Cloud OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | Google Cloud OAuth credentials |
| `DOMAIN_NAME` | (Optional) | Your custom domain |

## Deployment Process

### Option 1: Automated (GitHub Actions) - Recommended

1. Push to `main` branch:
   ```bash
   git push origin main
   ```

2. Monitor deployment:
   - Go to: `https://github.com/synerax-cloud/cvrax/actions`
   - Watch the workflow execute
   - Deployment takes ~20-25 minutes (first time)

3. Get your URL:
   - Check workflow output for `cloud_run_url`
   - Or run: `gcloud run services describe cvrax --region=us-central1 --format='value(status.url)'`

### Option 2: Manual Deployment

#### Step 1: Deploy Infrastructure

```bash
cd terraform

# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars

# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply infrastructure
terraform apply
```

**Wait 15-20 minutes** for Cloud SQL instance creation.

#### Step 2: Build and Deploy Application

```bash
# Authenticate Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Get Artifact Registry URL from Terraform output
export AR_URL=$(cd terraform && terraform output -raw artifact_registry_url)

# Build image
docker build -t $AR_URL/cvrax:latest .

# Push image
docker push $AR_URL/cvrax:latest

# Deploy to Cloud Run
gcloud run deploy cvrax \
  --image $AR_URL/cvrax:latest \
  --region us-central1 \
  --platform managed
```

#### Step 3: Update OAuth Redirect URI

1. Get your Cloud Run URL:
   ```bash
   gcloud run services describe cvrax --region=us-central1 --format='value(status.url)'
   ```

2. Add to Google OAuth:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Edit your OAuth client
   - Add authorized redirect URI: `https://YOUR-URL/api/auth/callback/google`

## Post-Deployment

### 1. Verify Deployment

```bash
# Check Cloud Run status
gcloud run services describe cvrax --region=us-central1

# Check logs
gcloud logs tail --service=cvrax --region=us-central1

# Test endpoint
curl https://YOUR-CLOUD-RUN-URL
```

### 2. Run Database Migrations (if needed)

Migrations run automatically on container startup via Dockerfile CMD.

To run manually:
```bash
# Get Cloud SQL connection name
export DB_CONN=$(cd terraform && terraform output -raw database_connection_name)

# Connect via Cloud SQL Proxy
cloud_sql_proxy -instances=$DB_CONN=tcp:5432

# In another terminal
export DATABASE_URL="postgresql://user:pass@localhost:5432/cvrax"
npx prisma migrate deploy
```

### 3. Set Up Custom Domain (Optional)

```bash
# Map domain to Cloud Run
gcloud run services update cvrax \
  --region=us-central1 \
  --add-custom-mapping=YOUR-DOMAIN.com

# Add DNS records (from output)
# Type: A, Name: @, Value: [IP from output]
# Type: CNAME, Name: www, Value: ghs.googlehosted.com
```

## Monitoring & Maintenance

### View Logs

```bash
# Real-time logs
gcloud logs tail --service=cvrax --region=us-central1 --follow

# Filter errors
gcloud logs read --service=cvrax --region=us-central1 --filter='severity>=ERROR' --limit=50
```

### Database Backups

Automatic backups are enabled (daily at 3 AM UTC, retained for 7 days).

Manual backup:
```bash
gcloud sql backups create --instance=cvrax-db-XXXX
```

### Scaling

Update in `terraform/terraform.tfvars`:
```hcl
min_instances = 1     # Always-on (no cold starts)
max_instances = 100   # Max concurrent instances
container_memory = "1Gi"
container_cpu = "2"
```

Apply changes:
```bash
cd terraform
terraform apply
```

### Cost Monitoring

```bash
# View current month estimate
gcloud billing accounts list
gcloud billing projects describe $PROJECT_ID

# Set budget alerts in GCP Console → Billing → Budgets
```

## Troubleshooting

### Database Connection Issues

```bash
# Check Cloud SQL status
gcloud sql instances describe cvrax-db-XXXX

# Test VPC connector
gcloud compute networks vpc-access connectors describe cvrax-vpc-connector --region=us-central1

# Check secrets
gcloud secrets versions access latest --secret=DATABASE_URL
```

### Deployment Failures

```bash
# Check Cloud Run revisions
gcloud run revisions list --service=cvrax --region=us-central1

# View failed revision logs
gcloud run revisions describe REVISION_NAME --region=us-central1
```

### OAuth Not Working

1. Verify redirect URIs match exactly (including https://)
2. Check `NEXTAUTH_URL` environment variable is correct
3. Ensure `NEXTAUTH_SECRET` is set and consistent

## Rollback

### Rollback Cloud Run Deployment

```bash
# List revisions
gcloud run revisions list --service=cvrax --region=us-central1

# Route traffic to previous revision
gcloud run services update-traffic cvrax \
  --region=us-central1 \
  --to-revisions=REVISION_NAME=100
```

### Rollback Infrastructure

```bash
cd terraform
git checkout PREVIOUS_COMMIT
terraform apply
```

## Cleanup

### Pause (Keep Data)

```bash
# Scale down to 0 instances
cd terraform
echo 'max_instances = 0' >> terraform.tfvars
terraform apply
```

### Full Deletion

⚠️ **WARNING: This deletes ALL data permanently**

```bash
# Remove deletion protection
cd terraform
# Edit resources.tf: deletion_protection = false
nano resources.tf

# Destroy everything
terraform destroy
```

## Security Best Practices

✅ Database uses private IP (not exposed publicly)
✅ Secrets in Secret Manager (not git or env vars)
✅ Service account with minimal permissions
✅ Automatic backups enabled
✅ HTTPS enforced
✅ VPC connector for secure DB access

## Support & Resources

- **Terraform Docs**: https://www.terraform.io/docs
- **Cloud Run**: https://cloud.google.com/run/docs
- **Cloud SQL**: https://cloud.google.com/sql/docs
- **GitHub Actions**: https://docs.github.com/actions
- **Next.js Deployment**: https://nextjs.org/docs/deployment

## Cost Optimization Tips

1. **Use db-f1-micro** for development (~$7/month vs $50+ for standard)
2. **Set min_instances=0** to avoid idle costs (accept cold starts)
3. **Enable Cloud SQL automatic shutdown** during low usage
4. **Set billing alerts** in GCP Console
5. **Use Committed Use Discounts** for predictable workloads

## Next Steps

1. ✅ Deploy infrastructure with Terraform
2. ✅ Set up GitHub Actions for CI/CD
3. ✅ Configure custom domain
4. 📊 Set up monitoring & alerts
5. 🔐 Review and harden security
6. 📈 Optimize for cost/performance
7. 🚀 Add more features!

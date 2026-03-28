#!/bin/bash
# Setup Workload Identity Federation for GitHub Actions (No Keys Required!)
# This is the secure, recommended method for GitHub Actions → GCP authentication

set -e

echo "🔐 CVRAX - Workload Identity Federation Setup"
echo "=============================================="
echo ""
echo "This script sets up keyless authentication between GitHub Actions and GCP"
echo "using Workload Identity Federation (recommended by Google)."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
read -p "Enter your GCP Project ID: " PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: Project ID is required"
    exit 1
fi

# Get GitHub repo
read -p "Enter GitHub repository (format: owner/repo, e.g., synerax-cloud/cvrax): " GITHUB_REPO
if [ -z "$GITHUB_REPO" ]; then
    echo "❌ Error: GitHub repository is required"
    exit 1
fi

echo ""
echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   GitHub Repo: $GITHUB_REPO"
echo ""

echo "📋 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo ""
echo "🔌 Enabling required GCP APIs (this may take 2-3 minutes)..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  servicenetworking.googleapis.com \
  compute.googleapis.com \
  artifactregistry.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com

echo "✅ APIs enabled"

# Create Terraform state bucket
echo ""
echo "🪣 Creating Terraform state bucket..."
BUCKET_NAME="$PROJECT_ID-terraform-state"
if gsutil ls -b gs://$BUCKET_NAME 2>/dev/null; then
    echo "ℹ️  Bucket already exists"
else
    gsutil mb -p $PROJECT_ID gs://$BUCKET_NAME
    gsutil versioning set on gs://$BUCKET_NAME
    echo "✅ Bucket created: gs://$BUCKET_NAME"
fi

# Update Terraform backend configuration
echo ""
echo "📝 Updating Terraform backend configuration..."
if [ -f "terraform/main.tf" ]; then
    sed -i.bak "s/bucket = \"cvrax-terraform-state\"/bucket = \"$BUCKET_NAME\"/" terraform/main.tf
    rm terraform/main.tf.bak 2>/dev/null || true
    echo "✅ Terraform backend updated"
fi

# Create service account
echo ""
echo "👤 Creating service account for GitHub Actions..."
SA_NAME="github-actions"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SA_EMAIL 2>/dev/null; then
    echo "ℹ️  Service account already exists"
else
    gcloud iam service-accounts create $SA_NAME \
        --display-name="GitHub Actions Deployer (Workload Identity)"
    echo "✅ Service account created"
fi

# Grant IAM roles
echo ""
echo "🔐 Granting IAM roles to service account..."
roles=(
    "roles/run.admin"
    "roles/cloudsql.admin"
    "roles/compute.networkAdmin"
    "roles/iam.serviceAccountAdmin"
    "roles/iam.serviceAccountUser"
    "roles/secretmanager.admin"
    "roles/artifactregistry.admin"
    "roles/serviceusage.serviceUsageAdmin"
)

for role in "${roles[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$role" \
        --condition=None \
        > /dev/null 2>&1
    echo "  ✓ $role"
done

echo "✅ IAM roles granted"

# Create Workload Identity Pool
echo ""
echo "🎭 Creating Workload Identity Pool..."
POOL_NAME="github-pool"
POOL_ID="projects/$PROJECT_ID/locations/global/workloadIdentityPools/$POOL_NAME"

if gcloud iam workload-identity-pools describe $POOL_NAME --location=global 2>/dev/null; then
    echo "ℹ️  Workload Identity Pool already exists"
else
    gcloud iam workload-identity-pools create $POOL_NAME \
        --location=global \
        --display-name="GitHub Actions Pool"
    echo "✅ Workload Identity Pool created"
fi

# Create Workload Identity Provider
echo ""
echo "🔗 Creating Workload Identity Provider for GitHub..."
PROVIDER_NAME="github-provider"
PROVIDER_ID="$POOL_ID/providers/$PROVIDER_NAME"

if gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
    --workload-identity-pool=$POOL_NAME \
    --location=global 2>/dev/null; then
    echo "ℹ️  Provider already exists"
else
    gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
        --workload-identity-pool=$POOL_NAME \
        --location=global \
        --issuer-uri="https://token.actions.githubusercontent.com" \
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
        --attribute-condition="assertion.repository=='$GITHUB_REPO'"
    echo "✅ Workload Identity Provider created"
fi

# Allow GitHub Actions to impersonate service account
echo ""
echo "🤝 Binding service account to GitHub repository..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/$POOL_ID/attribute.repository/$GITHUB_REPO" \
    > /dev/null 2>&1

echo "✅ Service account bound to GitHub repo"

# Get provider resource name
echo ""
echo "📊 Getting Workload Identity Provider details..."
WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
    --workload-identity-pool=$POOL_NAME \
    --location=global \
    --format='value(name)')

echo "✅ Configuration complete"

# Generate NextAuth secret
echo ""
echo "🔐 Generating NextAuth secret..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "✅ NextAuth secret generated"

# Display GitHub secrets
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 GITHUB SECRETS TO ADD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Go to: https://github.com/$GITHUB_REPO/settings/secrets/actions"
echo ""
echo "Add these secrets (click 'New repository secret'):"
echo ""
echo "1. GCP_PROJECT_ID"
echo "   $PROJECT_ID"
echo ""
echo "2. WIF_PROVIDER"
echo "   $WIF_PROVIDER"
echo ""
echo "3. WIF_SERVICE_ACCOUNT"
echo "   $SA_EMAIL"
echo ""
echo "4. NEXTAUTH_SECRET"
echo "   $NEXTAUTH_SECRET"
echo ""
echo "5. GOOGLE_CLIENT_ID"
echo "   (get from Google Cloud Console OAuth - see below)"
echo ""
echo "6. GOOGLE_CLIENT_SECRET"
echo "   (get from Google Cloud Console OAuth - see below)"
echo ""
echo "7. DOMAIN_NAME (optional)"
echo "   (leave empty for now)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ✅ Add all secrets to GitHub (see URL above)"
echo ""
echo "2. 🔐 Set up Google OAuth credentials:"
echo "   https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo "   - Create OAuth 2.0 Client ID"
echo "   - Type: Web application"
echo "   - Add redirect URI (temporary):"
echo "     http://localhost:3000/api/auth/callback/google"
echo "   - Copy Client ID and Secret to GitHub secrets"
echo ""
echo "3. 🚀 Deploy:"
echo "   git add ."
echo "   git commit -m 'Configure Workload Identity Federation'"
echo "   git push origin main"
echo ""
echo "4. 👀 Monitor deployment:"
echo "   https://github.com/$GITHUB_REPO/actions"
echo ""
echo "5. 🔄 After deployment, update OAuth redirect URI:"
echo "   - Get Cloud Run URL from GitHub Actions output"
echo "   - Add to OAuth: https://YOUR-URL/api/auth/callback/google"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Setup complete! This method is more secure (no keys to manage)."
echo ""
echo "💡 Benefits of Workload Identity Federation:"
echo "   - No service account keys to rotate or secure"
echo "   - Automatic token expiration"
echo "   - Fine-grained access control"
echo "   - Recommended by Google for CI/CD"
echo ""

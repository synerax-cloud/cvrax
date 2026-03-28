#!/bin/bash
# Setup script for GCP deployment prerequisites

set -e

echo "🚀 CVRAX GCP Deployment Setup"
echo "================================"
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
  cloudresourcemanager.googleapis.com

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
sed -i.bak "s/bucket = \"cvrax-terraform-state\"/bucket = \"$BUCKET_NAME\"/" terraform/main.tf
rm terraform/main.tf.bak 2>/dev/null || true
echo "✅ Terraform backend updated"

# Create service account
echo ""
echo "👤 Creating service account for GitHub Actions..."
SA_NAME="github-actions"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SA_EMAIL 2>/dev/null; then
    echo "ℹ️  Service account already exists"
else
    gcloud iam service-accounts create $SA_NAME \
        --display-name="GitHub Actions Deployer"
    echo "✅ Service account created"
fi

# Grant IAM roles
echo ""
echo "🔐 Granting IAM roles..."
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

# Create and download service account key
echo ""
echo "🔑 Creating service account key..."
KEY_FILE="github-actions-key.json"
if [ -f "$KEY_FILE" ]; then
    read -p "Key file already exists. Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing key file"
    else
        rm $KEY_FILE
        gcloud iam service-accounts keys create $KEY_FILE \
            --iam-account=$SA_EMAIL
        echo "✅ New key created: $KEY_FILE"
    fi
else
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SA_EMAIL
    echo "✅ Key created: $KEY_FILE"
fi

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
echo "Go to: https://github.com/synerax-cloud/cvrax/settings/secrets/actions"
echo ""
echo "Add these secrets (click 'New repository secret'):"
echo ""
echo "1. GCP_PROJECT_ID"
echo "   Value: $PROJECT_ID"
echo ""
echo "2. GCP_SA_KEY"
echo "   Value: (contents of $KEY_FILE - see below)"
echo ""
echo "3. NEXTAUTH_SECRET"
echo "   Value: $NEXTAUTH_SECRET"
echo ""
echo "4. GOOGLE_CLIENT_ID"
echo "   Value: (get from Google Cloud Console OAuth)"
echo ""
echo "5. GOOGLE_CLIENT_SECRET"
echo "   Value: (get from Google Cloud Console OAuth)"
echo ""
echo "6. DOMAIN_NAME (optional)"
echo "   Value: (leave empty for now)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 Service Account Key JSON (for GCP_SA_KEY secret):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat $KEY_FILE
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Copy the entire JSON above (including { and })"
echo "   and paste it as the GCP_SA_KEY secret value in GitHub"
echo ""
echo "🔒 Security: Delete this key file after copying:"
echo "   rm $KEY_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ✅ Add all secrets to GitHub (see URL above)"
echo ""
echo "2. 🔐 Set up Google OAuth credentials:"
echo "   https://console.cloud.google.com/apis/credentials"
echo "   - Create OAuth 2.0 Client ID"
echo "   - Type: Web application"
echo "   - Add redirect URI (temporary):"
echo "     http://localhost:3000/api/auth/callback/google"
echo "   - Copy Client ID and Secret to GitHub secrets"
echo ""
echo "3. 🚀 Deploy:"
echo "   git push origin main"
echo ""
echo "4. 👀 Monitor deployment:"
echo "   https://github.com/synerax-cloud/cvrax/actions"
echo ""
echo "5. 🔄 After deployment, update OAuth redirect URI:"
echo "   - Get Cloud Run URL from GitHub Actions output"
echo "   - Add to OAuth: https://YOUR-URL/api/auth/callback/google"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Setup complete! Add secrets to GitHub and deploy."
echo ""

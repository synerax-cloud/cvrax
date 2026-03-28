# Quick Start: Deploy CVRAX to GCP

## Prerequisites
- GCP account with billing enabled
- `gcloud` CLI installed
- GitHub repository access

## Setup (5 minutes)

### 1. Run Setup Script

```bash
cd cvrax
./scripts/setup-gcp.sh
```

This will:
- ✅ Enable required GCP APIs
- ✅ Create Terraform state bucket
- ✅ Create service account with proper permissions
- ✅ Generate service account key
- ✅ Generate NextAuth secret
- ✅ Display all values needed for GitHub secrets

### 2. Add GitHub Secrets

The script will show you exactly what to copy. Go to:
```
https://github.com/synerax-cloud/cvrax/settings/secrets/actions
```

Click "New repository secret" and add:

| Secret Name | Where to Get Value |
|-------------|-------------------|
| `GCP_PROJECT_ID` | Shown in script output |
| `GCP_SA_KEY` | Copy entire JSON from script output |
| `NEXTAUTH_SECRET` | Shown in script output |
| `GOOGLE_CLIENT_ID` | Get from Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Get from Google Cloud Console → APIs & Services → Credentials |
| `DOMAIN_NAME` | Leave empty for now (optional) |

### 3. Set Up Google OAuth

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: **Web application**
4. Name: **CVRAX**
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - Will add production URL after first deployment
6. Click "Create"
7. Copy **Client ID** and **Client Secret** to GitHub secrets (steps above)

### 4. Deploy

```bash
git add .
git commit -m "Configure deployment secrets"
git push origin main
```

### 5. Monitor Deployment

Watch progress at:
```
https://github.com/synerax-cloud/cvrax/actions
```

First deployment takes **~20-25 minutes** (Cloud SQL is slow to create).

### 6. Update OAuth Redirect URI

After deployment completes:

1. Get your Cloud Run URL from GitHub Actions output
2. Go back to Google Cloud Console → OAuth credentials
3. Add production redirect URI:
   ```
   https://YOUR-CLOUD-RUN-URL/api/auth/callback/google
   ```
4. Save

### 7. Test Your App

Open the Cloud Run URL shown in GitHub Actions output.

## Troubleshooting

### "retry function failed after 4 attempts"

**Problem**: `GCP_SA_KEY` secret not set in GitHub.

**Solution**: 
1. Run `./scripts/setup-gcp.sh` again
2. Copy the JSON output (entire thing, including `{` and `}`)
3. Add as `GCP_SA_KEY` secret in GitHub

### "Permission denied" errors

**Problem**: Service account doesn't have required permissions.

**Solution**: Re-run setup script, it will grant missing permissions.

### OAuth not working

**Problem**: Redirect URI doesn't match.

**Solution**: 
1. Check exact URL in browser
2. Ensure it matches OAuth credential exactly (with `https://`)
3. Don't forget `/api/auth/callback/google` at the end

## Cost

With default free-tier settings:
- **Cloud Run**: Free tier (2M requests/month)
- **Cloud SQL (db-f1-micro)**: ~$7-15/month
- **VPC Connector**: ~$9/month
- **Secret Manager**: Free (first 6 secrets)
- **Artifact Registry**: Free (0.5GB)

**Total: ~$16-25/month**

## Support

Full documentation: See [DEPLOYMENT.md](DEPLOYMENT.md)

Issues: https://github.com/synerax-cloud/cvrax/issues

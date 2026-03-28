# CVRAX Setup Guide

## Phase 1: Registration & Profile Implementation

### Prerequisites

Install the required software:

```bash
# 1. Install Node.js 18+ (if not already installed)
# macOS
brew install node

# Verify installation
node --version  # Should be 18 or higher
npm --version

# 2. Install PostgreSQL
# macOS
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb cvrax

# 3. Install LaTeX (optional for Phase 1, required for CV generation)
# macOS
brew install --cask mactex-no-gui
# or full version: brew install --cask mactex
```

### Step 1: Install Dependencies

```bash
cd /Users/shubham/Downloads/emailcampaign/cvrax

# Install all packages (including Tailwind plugins)
npm install

# Install Prisma CLI globally (optional)
npm install -g prisma
```

### Step 2: Setup Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

Update the following values:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cvrax"

# NextAuth Secret - Generate a random secret
# Run: openssl rand -base64 32
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET"

# Google OAuth - See instructions below
GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
```

### Step 3: Setup Google OAuth

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a new project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: "CVRAX" → Create

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "CVRAX Web Client"
   
5. **Configure Authorized URLs**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   
6. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Paste them into your `.env` file

### Step 4: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
# Opens at http://localhost:5555
```

### Step 5: Run Development Server

```bash
# Start the Next.js development server
npm run dev

# Server starts at http://localhost:3000
```

### Step 6: Test the Application

1. **Open browser**: http://localhost:3000
2. **Click "Get Started"** or "Sign In"
3. **Click "Continue with Google"**
4. **Authorize the application**
5. **You should be redirected to the dashboard**

### Verify Everything Works

```bash
# Check database connection
npx prisma studio

# Check if tables were created
# Should see: User, Account, Session, Profile, Experience, etc.

# Test authentication flow
# 1. Sign in with Google
# 2. Check if user appears in Prisma Studio
# 3. Navigate to dashboard
```

## Project Structure Overview

```
cvrax/
├── app/                      # Next.js 14 App Router
│   ├── api/auth/            # NextAuth endpoints
│   ├── auth/                # Login & Register pages
│   ├── dashboard/           # Dashboard pages
│   ├── globals.css          # Global styles
│   ├── layout.js            # Root layout
│   ├── page.js              # Home page
│   └── providers.js         # React providers
├── lib/                      # Utilities
│   ├── auth.js              # NextAuth configuration
│   └── prisma.js            # Prisma client
├── prisma/                   # Database
│   └── schema.prisma        # Database schema
├── .env.example             # Environment template
├── next.config.js           # Next.js config
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind config
└── README.md                # Documentation
```

## Common Issues & Solutions

### Issue: Database Connection Error

```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if stopped
brew services start postgresql@14

# Test connection
psql -U postgres -d cvrax -c "SELECT 1"
```

### Issue: NextAuth Error

```bash
# Verify environment variables
cat .env | grep NEXTAUTH

# Regenerate secret
openssl rand -base64 32

# Update .env with new secret
```

### Issue: Google OAuth Error

1. **Check redirect URI** in Google Console matches exactly:
   - `http://localhost:3000/api/auth/callback/google`
2. **Verify Client ID and Secret** are correct in `.env`
3. **Enable Google+ API** in Google Cloud Console

### Issue: Tailwind Styles Not Loading

```bash
# Rebuild with cache clear
rm -rf .next
npm run dev
```

### Issue: Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 npm run dev
```

## Development Tips

### Hot Reload

- Changes to files in `app/` automatically reload
- Changes to `prisma/schema.prisma` require `npx prisma generate`
- Changes to `.env` require server restart

### Database Changes

```bash
# After modifying schema.prisma
npx prisma generate      # Regenerate client
npx prisma db push       # Update database

# View data
npx prisma studio
```

### Debugging

```bash
# Check server logs
# Terminal shows all console.log outputs

# Check browser console
# F12 → Console tab

# NextAuth debug mode
# Add to .env:
# NEXTAUTH_DEBUG=true
```

## Next Steps (Phase 2-4)

### Phase 2: Profile Management
- [ ] Create profile form components
- [ ] Add experience/education CRUD
- [ ] Implement file upload for JD
- [ ] Build profile completion tracker

### Phase 3: LaTeX CV Generation
- [ ] Setup LaTeX service
- [ ] Create LaTeX templates
- [ ] Build CV preview interface
- [ ] Implement PDF generation

### Phase 4: GCP Deployment
- [ ] Create GCP project
- [ ] Setup Cloud Run
- [ ] Configure GitHub Actions
- [ ] Setup Cloud SQL

### Phase 5: AI Integration
- [ ] Integrate MCP server
- [ ] Build JD parser
- [ ] Implement CV optimization
- [ ] Add keyword matching

### Phase 6: Monetization
- [ ] Add template marketplace
- [ ] Implement Stripe
- [ ] Create subscription tiers
- [ ] Build payment flow

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth.js**: https://next-auth.js.org
- **Prisma**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Google OAuth**: https://console.cloud.google.com

## Need Help?

If you encounter issues:
1. Check this documentation first
2. Review error messages carefully
3. Check browser console (F12)
4. Check server terminal for errors
5. Review Prisma Studio for database state

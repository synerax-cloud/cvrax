# CVRAX - AI-Powered CV Generator

Professional CV builder with LaTeX templating, AI customization, and job description optimization.

## 🎯 Features

### Phase 1 (Current)
- ✅ Gmail OAuth integration
- ✅ User profile management
- ✅ LaTeX CV generation
- ✅ Job application details capture

### Phase 2 (Planned)
- 🔄 GCP deployment infrastructure
- 🔄 GitHub Actions CI/CD pipeline
- 🔄 Production-ready configuration

### Phase 3 (Planned)
- 🔄 Custom MCP server integration
- 🔄 AI-powered CV optimization
- 🔄 JD-based content suggestions

### Phase 4 (Planned)
- 🔄 Multiple CV templates
- 🔄 Template customization
- 🔄 Subscription model
- 🔄 Payment gateway integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- LaTeX distribution (TeX Live or MiKTeX)
- Google OAuth credentials

### Installation

```bash
# Clone and install
cd cvrax
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cvrax/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── profile/      # User profile CRUD
│   │   └── cv/           # CV generation
│   ├── auth/             # Auth pages (login, register)
│   ├── dashboard/        # User dashboard
│   ├── profile/          # Profile management
│   └── cv/               # CV builder interface
├── components/           # React components
│   ├── auth/            # Auth forms
│   ├── profile/         # Profile forms
│   ├── cv/              # CV editor components
│   └── ui/              # Reusable UI components
├── lib/                  # Utilities
│   ├── prisma.ts        # Database client
│   ├── auth.ts          # Auth configuration
│   ├── latex/           # LaTeX generation
│   └── utils.ts         # Helper functions
├── prisma/              # Database
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Migration files
├── public/              # Static assets
├── templates/           # LaTeX templates
└── styles/              # Global styles
```

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cvrax"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# LaTeX Service
LATEX_SERVICE_URL="http://localhost:3002"
```

## 📊 Database Schema

### User
- Email (from Google OAuth)
- Name, picture
- Profile information
- Subscription status

### Profile
- Personal details (name, phone, location)
- Work experience
- Education
- Skills
- Projects
- Certifications
- Languages

### CV
- Template selection
- Custom sections
- JD optimization history
- Generated PDF storage

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **CV Generation**: LaTeX (pdflatex)
- **File Storage**: Local/GCS (Phase 2)
- **AI Integration**: Custom MCP server (Phase 3)
- **Payments**: Stripe (Phase 4)

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio

# Linting
npm run lint
```

## 📝 LaTeX Templates

Templates are stored in `/templates` directory:
- `modern.tex` - Modern single-column design
- `classic.tex` - Traditional two-column layout
- `academic.tex` - Academic CV format
- `creative.tex` - Creative/designer layout

## 🔒 Security

- OAuth 2.0 authentication
- CSRF protection via NextAuth
- SQL injection prevention (Prisma)
- Rate limiting on API routes
- Secure file uploads
- Payment data encryption (Phase 4)

## 📈 Roadmap

- [x] Phase 1: Core authentication and profile
- [ ] Phase 2: GCP deployment infrastructure
- [ ] Phase 3: AI optimization integration
- [ ] Phase 4: Templates and monetization

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. For questions, contact the maintainer.

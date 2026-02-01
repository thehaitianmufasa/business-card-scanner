# Business Card Scanner

Privacy-first business card scanner that saves contacts directly to your own Google Sheets.

**Live Demo:** https://business-card-scanner-five.vercel.app

## Features

- **Snap & Scan** - Upload business card photos, AI extracts contact details instantly
- **Your Sheets** - Save contacts to your own Google Sheets (not ours)
- **Privacy First** - We never store your data; everything goes straight to your Google account

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- NextAuth.js v5 (Google OAuth)
- Google Cloud Vision API
- Google Sheets API

## Setup

### 1. Google Cloud Console

1. Create a new project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable APIs:
   - Cloud Vision API
   - Google Sheets API
   - Google Drive API

3. **OAuth Credentials** (for user sign-in):
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret

4. **Service Account** (for Vision API):
   - Go to APIs & Services > Credentials
   - Create Service Account
   - Download JSON key
   - Extract `client_email` and `private_key`

### 2. Environment Variables

Copy `.env.local` and fill in your credentials:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-random-secret  # Run: openssl rand -base64 32

# Google OAuth (for user sign-in + Sheets access)
GOOGLE_CLIENT_ID=your-oauth-client-id
GOOGLE_CLIENT_SECRET=your-oauth-client-secret

# Google Vision (service account)
GOOGLE_VISION_CLIENT_EMAIL=vision@project.iam.gserviceaccount.com
GOOGLE_VISION_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Run Development Server

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXTAUTH_URL` - Your Vercel deployment URL
   - `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID` - OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - OAuth Client Secret
   - `GOOGLE_VISION_CLIENT_EMAIL` - Service account email
   - `GOOGLE_VISION_PRIVATE_KEY` - Service account private key
4. Add production redirect URI in Google Cloud Console:
   `https://your-app.vercel.app/api/auth/callback/google`

## Project Structure

```
app/
├── page.tsx              # Landing page with sign-in
├── scan/page.tsx         # Main scanner (protected)
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── scan/route.ts
    └── sheets/
        ├── list/route.ts
        ├── create/route.ts
        └── append/route.ts
lib/
├── auth.ts               # NextAuth config
├── google/
│   ├── vision.ts         # Vision API client
│   └── sheets.ts         # Sheets helpers
└── ocr/extract.ts        # Contact extraction
components/
├── ImageUploader.tsx
├── ScanResult.tsx
├── SheetSelector.tsx
├── SignInButton.tsx
└── Providers.tsx
```

## Security Notes

- User tokens stored in encrypted httpOnly cookies (NextAuth handles this)
- Vision API uses separate service account (isolation)
- No user data stored on our servers
- Minimal Google scopes requested

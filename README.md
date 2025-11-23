# Resi My Server

A Next.js redirect service that redirects all requests to Zillow.com.

## How it works

- Any request to `http://mydomain.com/` redirects to `https://zillow.com/`
- Any request to `http://mydomain.com/123132` redirects to `https://zillow.com/123132`
- Any path after the domain is preserved and appended to `https://zillow.com/`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and deploy
4. Configure your custom domain in Vercel settings

The redirect service will work automatically once deployed!

## Example

- `http://mydomain.com/` → `https://zillow.com/`
- `http://mydomain.com/123132` → `https://zillow.com/123132`
- `http://mydomain.com/property/123456` → `https://zillow.com/property/123456`


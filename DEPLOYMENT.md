# 🚀 Deploying T-Bites to Vercel

This document guides you through deploying **T-Bites** to Vercel in just a few minutes.

---

## 🛠️ Step 1: Push Code to GitHub / GitLab / Bitbucket

Ensure your changes are committed and pushed to a remote git repository.

```bash
git add .
git commit -m "Prepare T-Bites for Vercel deployment"
git push origin main
```

---

## 🌐 Step 2: Import Project into Vercel

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Select your git repository (`T-Bites`).
4. Vercel will automatically detect **Next.js** as the framework preset.

---

## 🔑 Step 3: Configure Environment Variables in Vercel

Before clicking **Deploy**, expand the **Environment Variables** section and add the following keys from your `.env.local` / `.env.example`:

### **Sanity CMS Environment Variables**
| Key | Example Value | Required |
| :--- | :--- | :---: |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `r1clvwwn` | Yes |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Yes |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2025-01-01` | Yes |
| `SANITY_API_READ_TOKEN` | *your_sanity_read_token* | Optional |
| `SANITY_API_WRITE_TOKEN` | *your_sanity_write_token* | Optional |

### **Supabase Auth & Database Environment Variables**
| Key | Example Value | Required |
| :--- | :--- | :---: |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyz.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Yes |

---

## ⚡ Step 4: Deploy & Verify

1. Click **Deploy**.
2. Vercel will build and deploy your application.
3. Once completed, your T-Bites live production URL will be ready!

---

## 📝 Notes & Troubleshooting
- **Images**: Remote image domains (`images.unsplash.com`, `cdn.sanity.io`, `*.supabase.co`) are pre-configured in `next.config.ts`.
- **Middleware**: Next.js 16 Proxy Middleware (`proxy.ts`) is automatically picked up by Turbopack and Vercel Serverless Functions.
- **Sanity Studio**: You can access embedded Sanity Studio at `/studio` on your deployed site. Remember to add your Vercel deployment URL (e.g. `https://your-app.vercel.app`) to your Sanity CORS origins list in the [Sanity Management Console](https://sanity.io/manage).

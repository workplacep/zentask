# ZenTask — Production Deployment & Cloud Sync Guide

This guide explains how to use **ZenTask** as your daily to-do application on both **Desktop** and **Mobile**, and how your data is safely backed up in the cloud with **zero SQL configuration**.

---

## 1. Will the app remember all my tasks if it crashes, closes, or is deleted?

### **YES — 100% (When logged into your account)**

- **Local Mode (Without login)**:
  - Tasks are saved in your device's browser `localStorage`.
  - If you clear browsing data or uninstall, local data could be erased.

- **Cloud Synced Mode (Recommended)**:
  - Every task, due date, custom segment name, note, checklist, and project is stored in the cloud under your email account.
  - **If your PC crashes, your phone is replaced, the app is uninstalled, or browser data is wiped**:
    1. Open ZenTask on any phone, laptop, or browser.
    2. Enter your **Email and Password**.
    3. **All your tasks, custom segments, and projects instantly restore!**

---

## 2. The Simple Database Solution: Vercel + Upstash Redis (Zero SQL, 1-Click)

Unlike Supabase (which requires writing SQL scripts, managing relational tables, and setting up complex Row Level Security policies), ZenTask comes with **built-in serverless sync (`/api/auth` and `/api/sync`) using Upstash Redis**:

- **No SQL queries or tables to create**
- **No manual API URLs or keys to copy into the code**
- **100% Free tier** (generous limits for personal use)
- **Automatic credential linking** via Vercel

---

## 3. How to Deploy to GitHub & Vercel (Step-by-Step)

### Step 1: Push Code to GitHub

#### Method A: Using GitHub Desktop (Easiest if Git CLI is not installed)
1. Download & open [GitHub Desktop](https://desktop.github.com/).
2. Click **File** -> **Add Local Repository** -> select the `To Do App Project` folder.
3. Click **Publish repository** to GitHub (keep it Private or Public).

#### Method B: Using Git Command Line (If Git is installed)
```bash
git init
git add .
git commit -m "Initial ZenTask to-do app commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zentask.git
git push -u origin main
```

---

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Select your `zentask` GitHub repository and click **Import**.
4. In the Project configuration:
   - Framework Preset: **Vite** (detected automatically)
   - Click **Deploy**.
5. Within 60 seconds, your app is live on a custom HTTPS domain (e.g. `https://zentask-prem.vercel.app`)!

---

### Step 3: Connect the 1-Click Database (Zero SQL!)

To enable user accounts and cloud sync:
1. In your project dashboard on [vercel.com](https://vercel.com), click the **Storage** tab at the top.
2. Click **Create Database** -> select **Upstash (Redis)** (under the free marketplace integrations).
3. Follow the 1-click prompt:
   - Choose the free plan.
   - Click **Connect to Project**.
4. **Done!** Vercel automatically populates `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your project environment.
5. In your Vercel Project **Deployments** tab, click **Redeploy** so the new environment variables take effect.

---

### Step 4: Alternative Direct Deployment (Without GitHub)
If you don't want to use GitHub at all:
1. In your terminal inside the project folder, run:
   ```powershell
   npx.cmd vercel
   ```
2. Follow the terminal prompts to log into Vercel and deploy.
3. Go to your Vercel dashboard -> **Storage** -> **Upstash Redis** -> **Connect**.

---

## 4. How to Use on Desktop & Mobile Everyday

### On Desktop (Windows / Mac)
1. Open your live Vercel URL in **Google Chrome** or **Microsoft Edge**.
2. Click **Sync / Login** in the top navigation bar, select **Account Login**, and create your account.
3. Click the **Install App icon** in the address bar (or the **Install App** button in the top bar).
4. ZenTask now opens in its own window as a desktop app with an icon in your Windows Taskbar and Start Menu!

### On Mobile (iPhone / iOS)
1. Open your live Vercel URL in **Safari**.
2. Tap the **Share icon** (square with up arrow at the bottom).
3. Scroll down and tap **Add to Home Screen** -> tap **Add**.
4. Launch the ZenTask icon from your phone home screen and log in.

### On Mobile (Android)
1. Open your live Vercel URL in **Chrome**.
2. Tap the **three dots menu (⋮)** in the top right.
3. Tap **Install app** or **Add to Home screen**.
4. Launch the app and log in.

---

## 5. Advanced / Alternative: Supabase (Optional)
If you ever want a relational PostgreSQL database in the future, Supabase support remains built into the app:
- Open **Sync / Login** -> click the **Supabase (Advanced)** tab.
- Enter your Supabase Project URL and Anon Public Key.

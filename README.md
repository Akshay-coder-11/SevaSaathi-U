#  SevaSaathi - Multi-Dashboard Application

This repository contains the full-stack codebase for **SevaSaathi**, structured cleanly to allow independent development and deployment of the frontend and backend.

---

##  Repository Structure

Your project is structured with strict separation of concerns, keeping the repository clean and ready for deployment:

```text
├──  backend        <-- Node.js / Express / MongoDB (Deploy to Render)
├──  frontend       <-- React / Vite / Tailwind CSS (Deploy to Vercel)
├── .gitignore     <-- Configured to keep your repository ultra-clean
└── README.md      <-- This deployment guide
```

>  **Note on Root Wrapper Files:**
> Root files (`package.json`, `server.js`, `vite.config.js`, `index.html`) exist purely to run the integrated live preview inside AI Studio on a single port (3000). They are ignored by the root `.gitignore` so your public GitHub repository remains pristine with only the clean `frontend` and `backend` directories.

---

## 📤 Uploading to GitHub

You can manage and upload this project in two ways:

### Option 1: Monorepo (Easiest & Recommended)
Upload this entire folder as a single GitHub repository. Both Vercel and Render let you specify the "Root Directory" so they can build directly from the `frontend/` and `backend/` folders respectively.
* **Pros:** Easier to keep everything in sync, only one repository to manage.

### Option 2: Separate Repositories
Create two separate repositories on GitHub:
1. **Frontend Repo:** Upload only the contents of the `/frontend` directory.
2. **Backend Repo:** Upload only the contents of the `/backend` directory.

---

##  Separated Deployment Procedure

Follow these steps to deploy your frontend and backend on free-tier cloud platforms.

### 1. Deploy the Backend to Render
Render is a free and reliable cloud provider for Node.js APIs.

1. Create a free account at [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set up the configuration:
   * **Name:** `sevasaathi-backend`
   * **Language:** `Node`
   * **Region:** Choose a region close to your target audience (e.g., Singapore or Oregon).
   * **Branch:** `main`
   * **Root Directory:** `backend` *(Leave this empty if using a separate dedicated backend repo)*
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
5. Click **Advanced** and add the following **Environment Variables**:
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: *[Your MongoDB Atlas Connection String]*
   * `JWT_SECRET`: *[A random secure password string]*
   * `FRONTEND_URL`: *[Your Vercel deployment URL - update this once Vercel is deployed]*
6. Click **Create Web Service**. Your backend will build and start. Render will generate a live URL for you (e.g., `https://sevasaathi-backend.onrender.com`).

---

### 🔵 2. Deploy the Frontend to Vercel
Vercel provides lightning-fast hosting for static Vite-based React applications.

1. Create a free account at [Vercel.com](https://vercel.com).
2. Click **Add New...** and select **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   * **Framework Preset:** `Vite`
   * **Root Directory:** Click **Edit** and choose the `frontend` folder. *(Leave as default if using a separate dedicated frontend repo)*
   * **Build and Output Settings:** Leave as default (`vite build` and `dist`).
5. Open the **Environment Variables** accordion and add:
   * `VITE_API_BASE_URL`: `https://sevasaathi-backend.onrender.com/api` *(Make sure this matches your Render URL and has `/api` appended at the end)*
6. Click **Deploy**. Your frontend is now online! 🎉

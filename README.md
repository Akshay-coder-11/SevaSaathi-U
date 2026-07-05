# SevaSaathi - On-Demand Local Services Platform

SevaSaathi is a full-stack, multi-dashboard platform designed to connect local service seekers (Customers) with neighborhood freelance micro-contractors (Service Providers) in India. The application features highly specialized custom dashboards tailored to each user role, interactive real-time simulation engines, and an AI-powered helper companion.

---

## Project Explanation & Core Features

SevaSaathi handles end-to-end task dispatching, bidding, tracking, and diagnostics for common domestic services. 

### 1. User Roles & Dedicated Dashboards
*   **Customer Dashboard**:
    *   **Direct Search & Discovery**: Browse verified service providers across multiple categories (Electricians, Plumbers, Mechanics, Cooks/Chefs, Cleaners, Painters, Masons/Mistris, and general Helpers).
    *   **Direct & Emergency Bookings**: Book providers with structured location details (house number, street, city, pin code), custom dates, duration, instructions, and optional emergency fast-dispatch toggles.
    *   **Broadcast Booking Engine**: Broadcast open service request tenders to all nearby available professionals in a specific category, letting the first responder accept the job.
    *   **Live GPS Dispatch Simulator**: A simulated tracking engine that calculates real-time ETA and distance, advancing dynamically through five visual stages (*Assigned, Dispatched, Heading Over, Nearby, and Arrived at Doorstep*).
*   **Provider Dashboard**:
    *   **Profile Control**: Configure categories, hourly rates, custom introductory bios, and technical skill tags.
    *   **Real-time Availability**: Easily toggle availability status (`Available` or `Busy`) to manage job incoming flows.
    *   **Contract Management**: Review, accept, and update active assigned jobs, advancing their fulfillment statuses.
    *   **Earnings Tracker**: View total completed tasks and aggregated platform earnings.
*   **Admin Dashboard**:
    *   **Operational Control Room**: Manage and audit all active accounts, monitor total platform metrics, and track service categories.

### 2. SevaSaathi AI Mitra (AI Chatbot)
*   An intelligent chatbot helper powered by **Google Gemini API**.
*   Diagnoses home repair issues from descriptions, translates user problems into search categories, suggests standard diagnostic troubleshooting steps, and provides safety protocols before a technician arrives.

---

## File Structure

The project is structured with a strict separation of concerns, dividing code into modular, self-contained `frontend` and `backend` layers:

```text
├── backend/                      # Node.js, Express, and MongoDB Backend Server
│   ├── config/                   # Configuration files (Database connections, file upload setup)
│   │   ├── db.js                 # MongoDB connection logic using Mongoose
│   │   └── multer.js             # Image uploading helper
│   ├── controllers/              # Request handlers containing business logic
│   │   ├── aiController.js       # Handles Gemini API Mitra chat requests
│   │   ├── authController.js     # User registration, login, and verification logic
│   │   └── userController.js     # Handles user profiles and booking actions
│   ├── middleware/               # Express middlewares
│   │   ├── authMiddleware.js     # Validates JWT tokens and checks user roles
│   │   └── errorMiddleware.js    # Formats API error messages
│   ├── models/                   # Mongoose schemas representing database collections
│   │   ├── Booking.js            # Booking data schema (Date, address, status, cost)
│   │   └── User.js               # User accounts, custom profiles, and credentials
│   ├── routes/                   # Express router mapping API endpoints
│   │   ├── aiRoutes.js           # Router for chatbot endpoints
│   │   ├── authRoutes.js         # Router for auth & OTP verification
│   │   └── userRoutes.js         # Router for user profiles & bookings
│   ├── utils/                    # Shared utility files
│   │   ├── errorResponse.js      # Standardized custom error responses
│   │   ├── generateToken.js      # JWT token creation helper
│   │   └── sendEmail.js          # Handles OTP mail dispatches (or mock triggers)
│   ├── app.js                    # Core Express app initialization & route registration
│   ├── package.json              # Backend dependencies and execution scripts
│   └── server.js                 # Backend entry point running the HTTP server
│
├── frontend/                     # React, Vite, and Tailwind CSS Frontend Client
│   ├── src/                      # Source directory
│   │   ├── components/           # Reusable UI widgets (Navbar, Sidebar, Logo, ProtectedRoute)
│   │   ├── context/              # React Context Provider for global Authentication State
│   │   │   └── AuthContext.jsx   # Manages user token persistence and direct API logins
│   │   ├── layouts/              # Main page layouts
│   │   ├── pages/                # High-level route pages (Home, Login, Register, ForgotPassword)
│   │   │   └── Home.jsx          # Custom role-based dashboards, maps, and chatbot view
│   │   ├── services/             # Axios instance configured to handle base API URLs
│   │   │   └── api.js            # Automatically injects JWT headers on requests
│   │   ├── App.jsx               # React client routing table
│   │   ├── index.css             # Tailwinds global entry styles
│   │   └── main.jsx              # React app client entry point
│   ├── package.json              # Client-side configuration and scripts
│   ├── tailwind.config.js        # Custom Tailwind configurations
│   └── vite.config.js            # Vite build setup with React plugins
│
└── .gitignore                    # Ensures clean repository commits
```

---

## How to Run this Website Locally (VS Code Guide)

Follow this step-by-step procedure to set up, configure, and execute SevaSaathi on your local computer using Visual Studio Code:

### Step 1: Open the Project in VS Code
1. Download and extract the project `.zip` file into a local folder on your computer.
2. Open **VS Code**.
3. Select **File > Open Folder** (or **Open...** on macOS) and choose the extracted root project directory.

---

### Step 2: Configure Backend Environment Variables
1. Navigate to the `/backend` folder.
2. Create a new file named `.env` inside the `backend` directory.
3. Copy and paste the following environment variables into the `/backend/.env` file:

```env
# MongoDB Configuration (Replace with your own connection string or local MongoDB URI)
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/sevasaathi?retryWrites=true&w=majority

# JWT Token Configuration
JWT_SECRET=your_secret_jwt_key_here
JWT_EXPIRE=30d

# Email Transporter Setup (For sending real OTP codes)
# NOTE: If left blank, the app will run in "Mock Simulation Mode" 
# and log OTP codes directly to the terminal console so you can test logins.
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
FROM_NAME=SevaSaathi Support
FROM_EMAIL=noreply@sevasaathi.com

# Gemini AI API Key (Required for the SevaSaathi AI Mitra Chatbot)
GEMINI_API_KEY=your_gemini_api_key_here

# Port Configuration
NODE_ENV=development
PORT=5000
```

---

### Step 3: Configure Frontend Environment Variables
1. Navigate to the `/frontend` folder.
2. Create a new file named `.env` inside the `frontend` directory.
3. Copy and paste the following environment variable into the `/frontend/.env` file:

```env
# Points the React frontend to your local Express server
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### Step 4: Install Dependencies and Start the Backend Server
1. Open a new terminal in VS Code (**Terminal > New Terminal**).
2. Change your directory to the `backend` folder:
   ```bash
   cd backend
   ```
3. Install the required Node.js backend packages:
   ```bash
   npm install
   ```
4. Start the backend developer server in live reload mode (uses Nodemon):
   ```bash
   npm run dev
   ```
   *You should see output indicating that the backend server is running on port 5000 and the MongoDB connection status.*

---

### Step 5: Install Dependencies and Start the React Frontend
1. Open a **second separate terminal window** in VS Code (click the `+` icon on the terminal bar in VS Code).
2. Change your directory to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install the required React/Vite dependencies:
   ```bash
   npm install
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *Vite will compile your assets and display a local access URL (usually `http://localhost:5173` or `http://localhost:3000`).*

---

### Step 6: Explore the Website
1. Open your web browser and navigate to the Local URL printed by Vite (typically **`http://localhost:5173`**).
2. Create a **Customer** or **Provider** account on the registration page to test out the customized features, make live-simulated bookings, or chat with **AI Mitra**!

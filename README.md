# ASAP | Employee Task & Workflow Management System

A premium, full-stack employee task management and activity audit system built with **FastAPI** (Python 3.13) and **React** (Vite). The UI features a state-of-the-art dark-mode glassmorphic design and has a **Dual-Mode API service** that falls back gracefully to client-side `localStorage` when the FastAPI server is offline, making it fully interactive even as a static deployment!

---

## 🏗️ System Architecture

```
ASAP_miniproject/
├── backend/                  # FastAPI Application
│   ├── database.py           # SQLite connection & Sessionmaker
│   ├── models.py             # SQLAlchemy schemas (Employee, Task, Log)
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── crud.py               # Database transaction engines & activity hooks
│   ├── main.py               # FastAPI routers & CORS configurations
│   ├── requirements.txt      # Python dependencies
│   └── tasks.db              # SQLite Database (auto-generated)
└── frontend/                 # React Application (Vite)
    ├── index.html            # Core entry template (SEO optimized)
    ├── package.json          # Node script & dependencies
    └── src/
        ├── api.js            # Dual-Mode API manager (Backend API <-> LocalStorage)
        ├── index.css         # Glassmorphic Dark CSS Design System
        ├── main.jsx          # App entrypoint
        ├── App.jsx           # Tab layout manager & state controller
        └── components/       # Reusable UI components (Navbar, Cards, Modals)
```

---

## 🚀 Getting Started

### 1. Running the Backend Server
First, navigate to the `backend` folder and run the FastAPI server.

```bash
# Go to backend directory
cd backend

# Create a virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
venv\Scripts\Activate.ps1
# On Windows (CMD):
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
*The FastAPI server will be active at `http://127.0.0.1:8000`. You can inspect and test the API endpoints using the Swagger UI docs at `http://127.0.0.1:8000/docs`.*

### 2. Running the Frontend React App
Open a new terminal window, navigate to the `frontend` folder, and launch the Vite dev server.

```bash
# Go to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
*The web dashboard will be available at `http://localhost:5173`. It will automatically check if the FastAPI backend is running and connect. If the backend is not running, it switches to **Local Storage Mode** with pre-seeded mockup data so you can test all features.*

---

## ⚡ Key Features

1. **Dashboard Overview**: Access analytics card meters (Total Team, Tasks Allocated, Pending, and Completion Rates) and a live chronological activity log showing lifecycle transitions:
   `Employee Added` ➔ `Task Assigned` ➔ `Task Updated` ➔ `Task completed`
2. **Team Management**: Add employees with names, email validation checks, departments, and specific role titles.
3. **Task Space Board**: Allocate deliverables with priority levels (High, Medium, Low) and due dates to specific team members. Check progress in a custom Kanban board layout.
4. **Lifecycle Controls**: Start tasks (state changes from "Assigned" to "Updated") and complete tasks (state changes to "Completed"). Task details can also be deleted entirely.

---

## ☁️ Cloud Deployment Guidelines

### Frontend Deployment (Vercel or Netlify)
Since the frontend has a built-in LocalStorage mock fallback, it is fully runnable as a static site:
1. **GitHub Repository**: Push this code to your GitHub account.
2. **Vercel**:
   - Import your repository.
   - Set **Root Directory** to `frontend`.
   - Set **Build Command** to `npm run build`.
   - Set **Output Directory** to `dist`.
   - Click Deploy.
3. **Netlify**:
   - Connect your GitHub repo.
   - Set **Base Directory** to `frontend`.
   - Set **Build Command** to `npm run build`.
   - Set **Publish Directory** to `frontend/dist`.
   - Click Deploy.

### Backend Deployment (Render)
To host the database and python API:
1. Sign up on [Render](https://render.com/).
2. Create a new **Web Service** and link your GitHub repository.
3. Set the following settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Once deployed, update the `API_BASE_URL` in `frontend/src/api.js` (on line 1) to point to your Render service URL (e.g., `https://your-app.onrender.com`).

# 🌟 CalmSpace

<p align="center">
  <em>A comprehensive, multi-role therapeutic ecosystem designed to nurture emotional well-being, social confidence, and holistic care.</em>
</p>

---

## 📖 About The Project

**CalmSpace** is a unified platform bridging the gap between individuals, their parents, caregivers, and medical professionals. By offering tailored interfaces and tools for each role, CalmSpace ensures that emotional well-being and psychological care are managed efficiently, transparently, and engagingly. 

From interactive emotional regulation games like *EmotionPop* and *BullyBlock* for the users, to advanced analytics and risk scoring for doctors, CalmSpace is designed to be a safe haven for growth and continuous monitoring.

---

## ✨ Key Features by Role

### 🩺 For Doctors
- **Advanced Analytics & Risk Scoring:** Monitor patient progress with data-driven insights.
- **Care Plans:** Create and manage personalized therapeutic routines.
- **Patient Management:** Seamlessly handle multiple patients and their medical histories.
- **Secure Chat:** Direct communication lines with caregivers and parents.

### 🫂 For Caregivers
- **Incident Logging:** Log real-time observations and critical incidents.
- **Live Emotion Tracking:** Monitor the user's current emotional state.
- **Assigned Tasks:** View and manage daily therapeutic tasks.
- **Handoff Notes:** Ensure smooth transitions between different care providers.

### 👪 For Parents
- **Emotional Trends & History:** Keep track of long-term emotional well-being.
- **Crisis Alerts:** Real-time notifications for immediate interventions.
- **Session Reports:** Detailed insights into the user's therapy and app usage.
- **Social Confidence Tracking:** Monitor improvements in social interactions.

### 🎮 For Users (App)
- **CalmQuest Engine:** Gamified therapeutic exercises.
- **Interactive Games:** *BullyBlock*, *CalmControl*, *EmotionPop*, *MyCalmSpace*, *PeerPressurePanic*, and *SafeStrangerQuest*.
- **Mitra:** A friendly digital companion for social practice and daily check-ins.
- **Feelings Tracker:** Safe space to express and log daily emotions.

---

## 📁 Folder Structure

The project is structured as a modern monorepo separating the frontend and backend environments.

```text
CalmSpace/
├── backend/                  # FastAPI Python Backend
│   ├── app/                  # Application core logic, routes, and services
│   ├── venv/                 # Python Virtual Environment
│   ├── database.py           # Database connection and configuration
│   ├── main.py               # FastAPI application entry point
│   ├── models.py             # ORM models (e.g., SQLAlchemy)
│   ├── requirements.txt      # Python dependencies
│   └── schemas.py            # Pydantic models for data validation
│
├── frontend/                 # React + Vite Frontend
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable UI components & CalmQuest Games
│   │   ├── context/          # React Context providers (Auth, Emotion, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions, Firebase setup, mock data
│   │   ├── pages/            # Role-based route pages (Doctor, Parent, Caregiver, App)
│   │   └── index.css         # Global Tailwind styles
│   ├── package.json          # Frontend dependencies and scripts
│   ├── tailwind.config.ts    # Tailwind CSS configuration
│   └── vite.config.ts        # Vite bundler configuration
│
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

To run CalmSpace locally, you will need to start both the Backend server and the Frontend development server in two separate terminal windows.

### 1️⃣ Starting the Backend

The backend is powered by **Python** and **FastAPI**.

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment (if you haven't already):
   ```bash
   python3 -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows:**
     ```bash
     .\venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   > [!NOTE]
   > **Mac Users:** If you encounter a `ModuleNotFoundError` (e.g., `No module named 'sqlalchemy'`), it means your terminal is using the global `uvicorn`. Run `python3 -m uvicorn main:app --reload` instead to force it to use your virtual environment.

   *The backend will typically run on `http://localhost:8000`.*

### 2️⃣ Starting the Frontend

The frontend is built with **React**, **Vite**, and **TailwindCSS**.

1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will typically run on `http://localhost:5173`.*

---

## 🛠️ Technology Stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS, Radix UI (shadcn/ui), Firebase
- **Backend:** Python, FastAPI, Uvicorn
- **Styling:** Vanilla CSS & Tailwind utility classes for dynamic, responsive UI

---

<p align="center">
  <i>Built with ❤️ for better emotional and social well-being.</i>
</p>

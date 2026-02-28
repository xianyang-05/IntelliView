<p align="center">
  <img src="public/images/openhire-logo.png" alt="OpenHire Logo" width="80" />
</p>

<h1 align="center">OpenHire</h1>

<p align="center">
  <strong>AI-Powered HR Portal with Role-Based Access Control</strong>
</p>

<p align="center">
  A full-stack HR management platform combining a modern employee & HR admin portal with an AI chatbot powered by Ollama (Gemma), Google Gemini, and RAG (Retrieval-Augmented Generation) for intelligent, policy-backed HR assistance and resume screening.
</p>

---

## ✨ Key Features

### 🧑‍💼 Employee Portal
- **Home** — Personalized dashboard with quick stats and recent activity
- **Contract & Equity** — View and digitally sign contracts, track equity vesting
- **Ask HR** — Chat with an AI assistant that answers questions using real company policies and your personal data
- **Requests** — Submit and track leave applications, expense claims, and HR requests
- **Compliance & Alerts** — Stay up to date with regulatory changes, alerts, and compliance training
- **Personal Journal** — Personal work journal with reflections and goal tracking

### 👔 HR Admin Portal
- **Dashboard** — Organization-wide analytics, headcount trends, recent hires, and quick stats
- **Interview Center** — Review AI resume analysis, interview evaluations, and send offer letters
- **Budget Planning** — Headcount and budget forecasts 
- **Job Postings** — Manage public open job listings and company profiles
- **Performance** — Review role and workforce performance, generate AI reports (PIP/Promotions)
- **AI Decision Review** — Oversight on AI-generated decisions and policy updates

### 👁️ Candidate Portal
- **Job Board** — View open positions, upload resume for AI analysis, and take AI video screenings
- **My Offers** — Receive, review, and accept/negotiate offer letters

### 🤖 AI Chatbot (Three-Tier RBAC)
- **Employee** → Can only query their own data and ask about general policies
- **Manager** → Own data + direct reports' leave, salary, performance, and expenses
- **HR Admin** → Full access to all employee data and company-wide reports
- **RAG-Powered** — Answers are grounded in actual company policy documents indexed in ChromaDB

### 💬 Real-Time Chat
- Unified contact list across employees, HR staff, and managers
- Direct messaging with role-based visibility
- "Request Info" integration from HR workflows

---

## 🛠 Tech Stack

### 🌐 Frontend (Web Application)
- **Core Framework:** Next.js 16.1 integrated with React 19.2
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with plugins like tailwindcss-animate and autoprefixer)
- **UI Component Library:** shadcn/ui 
- **Icons:** Lucide React
- **Authentication:** Next-Auth (v5.0.0-beta.30)
- **Data Visualization:** Recharts (used for dashboards)
- **Computer Vision & Tracking:** MediaPipe Tasks Vision (for live webcam face-tracking and head-pose estimations)

### ⚙️ Backend (API Server)
- **Framework:** FastAPI (served via uvicorn)
- **Language:** Python 3
- **LLM/AI Integrations:** Anthropic (for Claude integration) and potentially local models (like Ollama as previously referenced)
- **Vector Database:** ChromaDB (used for storing and querying AI embeddings during resume analysis)
- **Data Parsing:** PyMuPDF (for extracting text from uploaded resumes)
- **TTS/Audio:** edge-tts (for generating text-to-speech audio for AI Interview questions)
- **Document Generation:** WeasyPrint (for generating PDFs like Warning or Termination letters)

---

## 📁 Project Structure

```
openhire/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # API endpoints (auth, chat proxy)
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Main entry point
├── components/
│   ├── candidate/          # Candidate portal components
│   │   ├── candidate-home.tsx      # Main application view & resume upload
│   │   ├── ai-interview.tsx        # AI video screening with MediaPipe tracking
│   │   └── job-board.tsx           # Public job listings
│   ├── employee/           # Employee portal components
│   │   ├── employee-chat.tsx       # AI chatbot interface
│   │   ├── employee-contracts.tsx  # Contract viewer & signing
│   │   ├── employee-requests.tsx   # Leave & expense requests
│   │   ├── employee-compliance.tsx # Compliance dashboard
│   │   └── ...
│   ├── hr/                 # HR admin components
│   │   ├── hr-dashboard.tsx        # HR analytics dashboard
│   │   ├── hr-interview-center.tsx # Interview management
│   │   ├── hr-contract-generation.tsx
│   │   ├── hr-performance-dashboard.tsx
│   │   └── ...
│   ├── ui/                 # Reusable UI primitives (shadcn/ui)
│   ├── chat-widget.tsx     # Real-time messaging widget
│   └── hr-employee-portal.tsx  # Main portal shell (routing, sidebar)
├── backend/
│   ├── server.py           # FastAPI backend (chat API, RAG, RBAC)
│   ├── ingest_policies.py  # Policy document ingestion into ChromaDB
│   ├── policies/           # Company policy documents (Markdown)
│   ├── chroma_db/          # ChromaDB vector store
│   └── requirements.txt    # Python dependencies
├── lib/                    # Shared utilities (Supabase client, helpers)
├── auth.ts                 # NextAuth configuration
└── middleware.ts           # Auth middleware
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **Firebase** project (with combinations of collections like: `users`, `resume_reports`, `offer_letters`, `employees`, etc.)

### 1. Clone & Install Frontend

```bash
git clone https://github.com/xianyang-05/OpenHire.git
cd openhire
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:
```env
# Firebase Config (replace with your actual values from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# NextAuth
AUTH_SECRET=your-auth-secret
GOOGLE_CLIENT_ID=your-google-client-id       # Optional: for Google OAuth
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Demo Accounts (role-based, no Firebase Auth required)
DEMO_HR_EMAIL=rachel.lim@openhire.com
DEMO_HR_PASSWORD=demo-hr-2024
DEMO_EMPLOYEE_EMAIL=alex.chan@openhire.com
DEMO_EMPLOYEE_PASSWORD=demo-employee-2024
DEMO_CANDIDATE_EMAIL=candidate@openhire.com
DEMO_CANDIDATE_PASSWORD=demo-candidate-2024
```

Create `backend/.env`:
```env
ANTHROPIC_API_KEY=your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
```

### 3. Install & Run Backend

```bash
cd backend
pip install -r requirements.txt
python ingest_policies.py   # Index policy documents into ChromaDB
python server.py            # Starts on http://localhost:8000
```

### 4. Run Frontend

```bash
npm run dev                 # Starts on http://localhost:3000
```

---

## 📄 License

This project is private and proprietary.

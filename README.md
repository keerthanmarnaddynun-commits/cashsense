# CashSense 💰🔍

CashSense is a real-time working capital analytics, cash flow forecasting, and AI-powered financial intelligence platform designed for small-to-medium enterprises (SMEs). It empowers business owners to monitor their current cash positions, evaluate upcoming invoices/receivables, simulate cash flow scenarios, and get context-aware, actionable advice from an AI copilot.

---

## 🏗️ System Architecture

CashSense is architected as a modern decoupled full-stack application consisting of a lightweight FastAPI backend, a highly responsive React (Vite + TS) frontend, a persistent SQLite database, and an integration with Google's Gemini LLM.

```
                  +----------------------------------+
                  |         React Frontend           |
                  |     (Vite + TypeScript + CSS4)   |
                  +-----------------+----------------+
                                    |
                                    | HTTP REST Requests
                                    v
                  +-----------------+----------------+
                  |         FastAPI Backend          |
                  |            (Python)              |
                  +--------+--------+--------+-------+
                           |        |        |
    Reads Mock Data        |        |        | Persists Chat History
    & Calculates Metrics   |        |        | & Snapshots
                           v        v        v
         +-----------------+   +----+--------+----+   +-----------------------+
         | mock_data.json  |   | SQLite Database  |   | Google Gemini API     |
         | (Financials)    |   | (cashsense.db)   |   | (gemini-flash-latest) |
         +-----------------+   +------------------+   +-----------------------+
```

### 1. Frontend Architecture (Client-Side)
- **Framework**: **React 19** with **TypeScript** for robust component-level typing.
- **Build Tool**: **Vite** for ultra-fast Hot Module Replacement (HMR) and compilation.
- **Styling**: **Tailwind CSS v4** utilizing modern CSS-based configurations and custom utility variables.
- **Routing**: **React Router v7** for declarative, page-based client-side routing.
- **State & Context**:
  - `AuthContext`: Manages user authentication state, session storage persistence, and handles email verification redirects.
  - Local component-level state and custom HTTP fetch wrappers.
- **Linter**: **Oxlint** for fast, native code analysis.

### 2. Backend Architecture (Server-Side)
- **Framework**: **FastAPI** (Asynchronous Python) serving high-performance, automated OpenAPI endpoints.
- **AI Core Integration**: **Google GenAI SDK** interacting with the `gemini-flash-latest` model.
- **Database ORM**: **SQLAlchemy** to manage relational tables in an SQLite engine.
- **Multi-threading**: Implements SQLite with `check_same_thread=False` to seamlessly support FastAPI's asynchronous routing context.

### 3. Data & Storage Layer
- **Local SQLite Database (`cashsense.db`)**: Manages conversations, user/assistant chat history, and captures snapshots of financials.
- **Mock Financial Store (`mock_data.json`)**: Emulates real ERP or bookkeeping integrations (like QuickBooks, Tally, or Stripe) containing active accounts, pending client invoices, and scheduled business expenses.

---

## 🛠️ Tech Stack & Dependencies

### Backend
- **Python**: `3.14+`
- **FastAPI**: Lightweight REST routing.
- **Uvicorn**: ASGI web server.
- **SQLAlchemy**: Relational database mapping.
- **Google GenAI**: Gemini SDK for advanced financial reasoning.
- **python-dotenv**: Environment configuration loading.

### Frontend
- **React**: `v19`
- **TypeScript**: `v6`
- **Vite**: `v8`
- **Tailwind CSS**: `v4`
- **React Router Dom**: `v7`
- **Lucide React**: Vector icons.
- **Oxlint**: Modern Rust-powered JavaScript/TypeScript linter.

---

## 📂 Project Directory Structure

```
cashsense/
├── backend/
│   ├── main.py              # Main FastAPI application entrypoint, REST routers & AI integration
│   ├── database.py          # SQLAlchemy models (Conversation, Message, FinancialSnapshot) & DB session helpers
│   ├── mock_data.json       # Financial data store representing the company's ledger
│   ├── cashsense.db         # Persistent SQLite database (automatically generated)
│   ├── .env                 # Environment secrets (GEMINI_API_KEY)
│   ├── .gitignore           # Python & SQLite ignore rules
│   └── requirements.txt     # Python backend dependencies
└── frontend/
    ├── src/
    │   ├── assets/          # Static assets (SVGs, Hero images)
    │   ├── components/      # Reusable UI components
    │   │   ├── AppLayout.tsx             # Shared navigation sidebar and responsive shell layout
    │   │   ├── CashRunwayGauge.tsx       # Gauge showing cash runway in days with warning levels
    │   │   ├── ForecastChart.tsx         # Visual representation of predicted cash positions
    │   │   ├── ForecastConfidence.tsx    # Statistical confidence scores & predictive indicators
    │   │   ├── GemmaCopilot.tsx          # Chat companion UI widget with auto-scroll and markdown parsing
    │   │   ├── Header.tsx                # Contextual application header
    │   │   ├── InvoiceRiskMatrix.tsx     # High/Medium/Low-risk mapping for pending invoices
    │   │   ├── MetricCard.tsx            # Standardized statistical widget with loading and currency formatting
    │   │   ├── PriorityActionQueue.tsx   # Actionable system alerts pointing out critical financial issues
    │   │   ├── ProtectedRoute.tsx        # Guards authenticated routes and handles unverified email redirects
    │   │   ├── RiskAlertBanner.tsx       # Dynamic banner warning about upcoming cash shortfalls
    │   │   ├── TodayBriefing.tsx         # AI-summarized executive overview of daily business health
    │   │   └── Topbar.tsx                # Secondary utility bar and user profiles
    │   ├── context/
    │   │   └── AuthContext.tsx           # Mock token-based JWT and session management
    │   ├── pages/
    │   │   ├── DashboardPage.tsx         # Central analytical command-center
    │   │   ├── ActionsPage.tsx           # Page dedicated to outstanding invoice collections and followups
    │   │   ├── InvoicesPage.tsx          # Register of all company invoices categorized by status
    │   │   ├── ScenarioLabPage.tsx       # Sandbox simulator for modelling runway delays
    │   │   ├── CopilotPage.tsx           # Dedicated full-screen chat interface with GemmaCopilot
    │   │   ├── SettingsPage.tsx          # System preferences & business configuration page
    │   │   ├── Login.tsx                 # SaaS entry authentication gateway
    │   │   ├── Register.tsx              # User sign-up page
    │   │   └── VerifyEmail.tsx           # Registration verification wall
    │   ├── services/
    │   │   └── api.ts                    # Abstracted fetch clients calling FastAPI backend
    │   ├── types.ts                      # Global TypeScript interfaces
    │   ├── App.tsx                       # Main React router controller and server connection check
    │   ├── main.tsx                      # Vite React mounting point
    │   └── index.css                     # Tailwind CSS v4 directives & custom glow-card styles
    ├── index.html                        # Frontend HTML structure
    ├── tsconfig.json                     # TypeScript configuration
    ├── vite.config.ts                    # Vite compilation configuration (Tailwind integration)
    ├── package.json                      # Node packages & npm scripts
    └── README.md                         # Boilerplate Vite documentation
```

---

## 🌟 Key Application Features

### 1. Executive Analytics Dashboard
- Retrieves and parses real-time cash ledger details from `/api/financials`.
- **Dynamic Runway Gauge**: Computes the exact cash runway in days, shifting from safe zones (green) to warning/insolvency alerts (red).
- **Core KPIs**: Tracking of Current Cash, Pending Receivables, Upcoming Expenses, and Net Forecast positions.

### 2. Scenario Lab
- Interactive sandbox modeling. Users use a interactive slider (from 0 to 30 days) to simulate customer payment delays.
- Instantly recalculates runway length, minimum projected cash cushions, and displays tailored AI insights based on the delay threshold.

### 3. GemmaCopilot AI Assistant
- Integrated full-screen and mini-widget chat assistants powered by `gemini-flash-latest`.
- Context-Injection: Every user message seamlessly appends structured system instructions describing the business's name, currency, exact cash balance, pending collections, and outstanding overdue invoices.
- **Persistent Memory**: SQLite retains historical conversation threads, allowing seamless follow-up questions about complex business circumstances.

### 4. Invoice Risk Matrix
- Automatically analyzes payment collection risk (Low/Medium/High) by parsing historical behavior patterns (e.g. "Chronically late", "Always pays on time") and due dates against the current date anchor.

---

## 🔐 Database Schema

SQLite creates three core tables configured within `database.py`:

```sql
CREATE TABLE conversations (
    id VARCHAR PRIMARY KEY, -- UUID string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id VARCHAR,
    role VARCHAR, -- 'user' or 'model'
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE TABLE financial_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id VARCHAR,
    raw_data_json TEXT, -- JSON snapshot of mock_data at session start
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Ensure **Python 3.14+** and **Node.js (v18+)** are installed on your workstation.

---

### Backend Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Initialize and Activate Virtual Environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   # For Windows Power Shell: .venv\Scripts\Activate.ps1
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Secrets & Environment Variables**:
   Create a `.env` file in the `backend` folder and populate your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_google_gemini_api_key_here
   ```

5. **Start the FastAPI Server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The API documentation is accessible at `http://127.0.0.1:8000/docs`.*

---

### Frontend Setup

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

3. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   *The React application will mount at `http://localhost:5173`.*

4. **Verify / Lint the codebase**:
   ```bash
   npm run lint
   # Check TypeScript compilation rules:
   npm run build
   ```

---

## 🔄 Live Data Integration Flow

1. On mount, `App.tsx` hits `/api/financials` to verify server connectivity.
2. The Dashboard loads financial variables from `mock_data.json` inside Python.
3. Python logic processes total accounts receivable, highlights overdue client balances, calculates remaining days of cash runway, and sends a packaged JSON response to React.
4. When talking to `GemmaCopilot`, the backend pulls previous conversations from `cashsense.db`, merges it with the dynamic business profile context, and streams it to the Gemini models to formulate professional remediation actions (like generating collection emails, requesting debt refactors, or adjusting expense structures).

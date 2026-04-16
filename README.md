# 🏥 MedChain India

**Blockchain-based Healthcare Record System for India**

A secure, decentralized system where patients own their medical records, doctors access records with permission, and emergency access is available via QR code.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green) ![Blockchain](https://img.shields.io/badge/Blockchain-Polygon%20Mock-purple) ![i18n](https://img.shields.io/badge/Languages-EN%20HI%20TA-orange)

---

## 🚀 Features

### Core
- **3 User Roles** — Patient, Doctor, Trusted Person
- **JWT Authentication** with role-based access control
- **Patient Dashboard** — View/upload records, grant/revoke access
- **Doctor Dashboard** — View patient records, upload prescriptions, add notes
- **Trusted Person Access** — Read-only with tiered permissions (Basic/Medium/Full)
- **Emergency QR Code** — Temporary access to critical data (single-use, 30-min expiry)

### Blockchain & Security
- **Mock Polygon Blockchain** — Stores record hashes, logs all access immutably
- **Simulated IPFS** — CID-like file storage
- **Data Encryption** — Fernet/AES encryption for sensitive data
- **Zero-trust emergency access** — All access logged on-chain

### AI Features
- **Medical Record Summarizer** — Rule-based NLP extraction
- **Drug Interaction Checker** — Checks 9+ known drug interactions
- **Voice Input Simulation** — Bhashini API mock (EN/HI/TA)

### UI/UX
- **Multi-language** — English, Hindi (हिंदी), Tamil (தமிழ்)
- **Mobile-first design** — Responsive with glassmorphism
- **Dark mode** — Premium dark UI with glow effects
- **Mock Aadhaar verification**

---

## 📂 Project Structure

```
MedChain-India/
├── backend/
│   ├── main.py              # FastAPI application 
│   ├── config.py            # Configuration
│   ├── database.py          # SQLAlchemy setup
│   ├── requirements.txt     # Python dependencies
│   ├── models/
│   │   ├── user.py          # User model
│   │   ├── record.py        # Medical record model
│   │   ├── access.py        # Access grants, trusted persons, QR
│   │   └── blockchain.py    # Blockchain log model
│   ├── routers/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── patients.py      # Patient CRUD & access management
│   │   ├── doctors.py       # Doctor dashboard & actions
│   │   ├── trusted.py       # Trusted person access
│   │   ├── emergency.py     # Emergency QR access
│   │   ├── blockchain.py    # Blockchain logs & verification
│   │   └── ai.py            # AI features
│   ├── services/
│   │   ├── auth_service.py  # JWT & password hashing
│   │   ├── blockchain_service.py  # Mock blockchain
│   │   ├── ipfs_service.py  # Simulated IPFS
│   │   └── ai_service.py    # AI/NLP functions
│   └── utils/
│       ├── encryption.py    # AES encryption
│       └── qr_generator.py  # QR code generation
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Router & app structure
│   │   ├── index.css        # Design system & Tailwind
│   │   ├── i18n/index.js    # Multi-language translations
│   │   ├── services/api.js  # Axios API client
│   │   ├── context/AuthContext.jsx  # Auth state
│   │   ├── components/Layout.jsx    # App layout
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── PatientDashboard.jsx
│   │       ├── DoctorDashboard.jsx
│   │       ├── TrustedDashboard.jsx
│   │       ├── RecordsPage.jsx
│   │       ├── AccessPage.jsx
│   │       ├── TrustedPage.jsx
│   │       ├── EmergencyPage.jsx
│   │       ├── EmergencyAccessPage.jsx
│   │       ├── BlockchainPage.jsx
│   │       ├── AIPage.jsx
│   │       └── DoctorPatientView.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🛠️ Setup Instructions

### Prerequisites
- **Python 3.9+** with pip
- **Node.js 18+** with npm

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/api/docs

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (already done if you cloned)
npm install

# Start dev server
npm run dev
```

App: http://localhost:5173

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get profile |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| GET | `/api/patients/dashboard` | ✅ Patient | Dashboard data |
| GET | `/api/patients/records` | ✅ Patient | Get records |
| POST | `/api/patients/records` | ✅ Patient | Upload record |
| POST | `/api/patients/grant-access` | ✅ Patient | Grant doctor access |
| DELETE | `/api/patients/revoke-access/{id}` | ✅ Patient | Revoke access |
| POST | `/api/patients/trusted` | ✅ Patient | Add trusted person |
| POST | `/api/patients/emergency-qr` | ✅ Patient | Generate QR |
| GET | `/api/doctors/dashboard` | ✅ Doctor | Doctor dashboard |
| GET | `/api/doctors/records/{id}` | ✅ Doctor | View patient records |
| POST | `/api/doctors/prescriptions` | ✅ Doctor | Upload prescription |
| GET | `/api/trusted/dashboard` | ✅ Any | Trusted dashboard |
| GET | `/api/emergency/{token}` | ❌ | Emergency access |
| GET | `/api/blockchain/logs` | ✅ | Transaction logs |
| GET | `/api/blockchain/status` | ❌ | Chain status |
| POST | `/api/ai/summarize` | ✅ | AI summarizer |
| POST | `/api/ai/drug-check` | ✅ | Drug interaction check |

---

## 🧪 Quick Test Flow

1. **Register** as Patient → Dashboard with 0 records
2. **Upload** a medical report → See IPFS hash & blockchain TX
3. **Register** a 2nd account as Doctor
4. **Patient grants access** to Doctor email
5. **Doctor logs in** → Sees patient in list, views records
6. **Patient generates QR** → Emergency access link
7. **Visit QR URL** → See critical data without login
8. **Check Blockchain** → All actions logged with TX hashes
9. **Try AI** → Summarize text, check drug interactions
10. **Switch language** → Toggle EN/HI/TA in sidebar

---

## 🔒 Security Architecture

- **JWT** — Stateless token auth (24h expiry)
- **bcrypt** — Password hashing
- **Fernet (AES)** — Symmetric data encryption
- **RBAC** — Role-based endpoint access
- **Blockchain audit trail** — Immutable access logs
- **Single-use QR** — Emergency tokens expire in 30 min

---

## 📱 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | FastAPI (Python) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Blockchain | Mock Polygon (SHA-256 hashing) |
| Storage | Simulated IPFS (local FS) |
| Auth | JWT (python-jose) + bcrypt |
| AI/NLP | Python rule-based |
| i18n | react-i18next |
| Icons | Lucide React |

---

## 📝 License

MIT License — Built for hackathon demonstration purposes.
"# MedTech-Hack" 

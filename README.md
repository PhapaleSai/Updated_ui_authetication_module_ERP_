# PVG College Auth & Enterprise Management System 🎓

A professional-grade authentication, authorization, and administrative suite built for **PVG College of Science**.

**Technology Stack:** React (Vite) · FastAPI · PostgreSQL · SQLAlchemy · Glassmorphism UI

---

## 🌟 Enhanced Enterprise Features

1. **Dual-Portal Architecture**:
   - **User Portal (`:5175`)**: Secure registration and profile management for students.
   - **Admin Portal (`:5173`)**: High-performance dashboard for institutional oversight.

2. **Enterprise Admin Dashboard**:
   - **Interactive Live Telemetry**: Real-time tracking of logins, registrations, and system events.
   - **Granular RBAC**: Manage roles and permissions with a visual policy editor.
   - **User Directory**: Deep-dive into specific user profiles with dedicated security audit timelines.
   - **System Health**: Active monitoring of server load, database connectivity, and auth caches.

3. **Robust Security & Auditing**:
   - **JWT with Session Expiry**: Every token event (login/logout) is tracked with IP and expiry data.
   - **Database-Level Auditing**: Global `AuditMixin` ensures every change is timestamped and attributed.

---

## 🚀 Unified Quick Start

Launch the entire ecosystem (3 Services: Backend + Frontend Portals) with a single command:

```powershell
# Run the professional startup sequence
.\start_erp.bat
```

This will automatically clean up ghost processes, free the required ports, and launch:
1. **Auth Backend** (Port 8000)
2. **Authentication Admin Dashboard** (Port 5173)
3. **Student User Login/Profile** (Port 5175)
4. **SIS Module** (External Ngrok)
5. **Admission Module** (External Ngrok)

### 🛠️ Manual Execution (Step-by-Step)

If you prefer to run services manually in separate terminals:

**1. Start Backend API**
```powershell
cd backend
.\venv\Scripts\activate
# Use this command to avoid venv launcher errors
python -m uvicorn main:app --port 8000 --reload
```

**2. Start Frontend Portals (Combined)**
```powershell
cd frontend
npm run dev
```
*(This launches both Admin on :5173 and User on :5175 simultaneously)*

**3. Start Ngrok Tunnels (For External Access)**
```powershell
# Run from the project root directory
#PS D:\taking_my_code_out> .\run_both_ngrok.bat
.\run_both_ngrok.bat
```

---

### Your Dashboard Addresses:

- **Authentication Admin (Users, Roles, RBAC)**: [http://localhost:5173](http://localhost:5173)
- **Student User Login (Personal Profile)**: [http://localhost:5175](http://localhost:5175)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🗄️ Database Architecture (PostgreSQL)

The system uses a unified **PostgreSQL** database named `pvg_auth` to handle authentication.

### 1. Initialization Logic
The core schema and security policies are defined in [setup_auth_tables.sql](file:///d:/Merging_auth_&_admission/setup_auth_tables.sql). This file performs:
- **Schema Creation**: Tables for RBAC, Users, Documents, and Login Logs.
- **Module Seeding**: Populates 10 institutional modules (Admission, Exam, Attendance, etc.).
- **Smart Permissioning**: Dynamically generates `VIEW`, `CREATE`, `EDIT`, and `APPROVE` permissions for every system feature.

### 2. Relational Security Model (RBAC)
The system follows a strict hierarchical permission model:
- **Modules**: High-level functional areas (e.g., Admission & Enrollment).
- **Features**: Specific tools within a module (e.g., Upload Documents).
- **Permissions**: Atomic actions mapped to features (e.g., Upload Documents - CREATE).
- **Role Permissions**: Maps institutional roles (`admin`, `hod`, `student`) to specific permissions.

### 3. Core Tables Summary:
- `users`: Stores emails and secure Argon2 password hashes.
- `roles`: Institutional identities with unique descriptions.

- `login_log`: Real-time audit trail of all security events.

---

## 📋 System Setup

### 1. Database (PostgreSQL)
Ensure PostgreSQL is running on `localhost:5432`.
1. Create database `pvg_auth`.
2. Initialize schema:
   ```bash
   psql -U postgres -d pvg_auth -f setup_auth_tables.sql
   ```

### 2. Environment Configuration
Create a `.env` in the `backend/` folder:
```env
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/pvg_auth
SECRET_KEY=pvg_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 3. Folder Structure
- `/backend`: FastAPI core and SQLAlchemy models.
- `/frontend/user`: Vite-based student registration portal.
- `/frontend/admin`: Premium administrative dashboard.

---

## 🔐 API Reference
- **Admin**: `GET /admin/stats`, `GET /admin/users`, `GET /admin/audit`
- **Auth**: `POST /auth/login`, `POST /auth/register`, `POST /roles/assign`
- **Profiles**: `GET /users/me`, `GET /admin/users/{id}`

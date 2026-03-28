# 🏢 Sankar Finance Consultancy – HRMS System

## 📁 Project Structure
```
hrms-system/
├── backend/
│   ├── server.js              ← Main server entry point
│   ├── config/db.js           ← MongoDB connection
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   └── Payslip.js
│   └── routes/
│       ├── auth.js            ← /api/auth/login, /api/auth/register
│       ├── admin.js           ← /api/admin/employees, payslips, attendance
│       └── employee.js        ← /api/employee/profile, payslips, attendance
├── frontend/
│   ├── login.html
│   ├── admin-dashboard.html
│   ├── employee-dashboard.html
│   ├── employee-onboarding.html
│   ├── css/style.css
│   └── js/main.js             ← Central API helper
├── .env
└── package.json
```

## 🚀 How to Run

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017)

### Steps
```bash
cd hrms-system
npm install
npm start
```

Open: **http://localhost:5000**

## 🔐 Default Login Credentials

| Role     | Email                          | Password       |
|----------|-------------------------------|----------------|
| Admin    | paidigowthami.tt@gmail.com    | Gowthami@123   |
| Employee | employee@sankar.com           | emp123         |

> **New employees** added by admin get password: `emailprefix@123`
> Example: `john@sankar.com` → password: `john@123`

## 📡 API Endpoints

| Method | Endpoint                         | Description          |
|--------|----------------------------------|----------------------|
| POST   | /api/auth/login                  | Login                |
| POST   | /api/auth/register               | Register user        |
| GET    | /api/admin/employees             | All employees        |
| POST   | /api/admin/employees             | Add employee         |
| PUT    | /api/admin/employees/:empId      | Update employee      |
| DELETE | /api/admin/employees/:empId      | Delete employee      |
| GET    | /api/admin/stats                 | Dashboard stats      |
| POST   | /api/admin/payslips              | Upload payslip       |
| GET    | /api/admin/payslips              | All payslips         |
| DELETE | /api/admin/payslips/:id          | Delete payslip       |
| POST   | /api/admin/attendance            | Mark attendance      |
| GET    | /api/admin/attendance/:empId     | Employee attendance  |
| GET    | /api/employee/profile            | My profile           |
| GET    | /api/employee/payslips           | My payslips          |
| GET    | /api/employee/attendance         | My attendance        |

## 🔧 Configuration (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://hrms:hrms123@cluster0.upir4ap.mongodb.net/hrms
JWT_SECRET=sankar_finance_hrms_secret_2024
```

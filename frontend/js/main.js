// ─── Sankar Finance HRMS – main.js ───────────────────────────
const API_BASE = "";  // same origin (server serves frontend)

// ── Auth helpers ──────────────────────────────────────────────
function getToken()    { return localStorage.getItem("hrms_token"); }
function getUser()     { return JSON.parse(localStorage.getItem("hrms_user") || "{}"); }
function isAdmin()     { return getUser().role === "admin"; }
function isEmployee()  { return getUser().role === "employee"; }

function logout() {
  localStorage.removeItem("hrms_token");
  localStorage.removeItem("hrms_user");
  window.location.href = "/login.html";
}

function requireAuth(expectedRole) {
  const token = getToken();
  const user  = getUser();
  if (!token || !user.role) { window.location.href = "/login.html"; return; }
  if (expectedRole && user.role !== expectedRole) {
    alert("Access denied!");
    window.location.href = "/login.html";
  }
}

// ── API fetch helper ─────────────────────────────────────────
async function apiCall(method, endpoint, body = null) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    }
  };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(API_BASE + endpoint, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

// ── Login ────────────────────────────────────────────────────
async function handleLogin(email, password) {
  const data = await apiCall("POST", "/api/auth/login", { email, password });
  localStorage.setItem("hrms_token", data.token);
  localStorage.setItem("hrms_user",  JSON.stringify({ role: data.role, empId: data.empId, name: data.name }));
  return data;
}

// ── Admin: Employees ─────────────────────────────────────────
async function getAllEmployees()         { return apiCall("GET",    "/api/admin/employees"); }
async function addEmployee(data)         { return apiCall("POST",   "/api/admin/employees", data); }
async function updateEmployee(empId, d)  { return apiCall("PUT",    `/api/admin/employees/${empId}`, d); }
async function deleteEmployee(empId)     { return apiCall("DELETE", `/api/admin/employees/${empId}`); }
async function getAdminStats()           { return apiCall("GET",    "/api/admin/stats"); }

// ── Admin: Payslips ───────────────────────────────────────────
async function uploadPayslip(data)       { return apiCall("POST",   "/api/admin/payslips", data); }
async function getAllPayslips()           { return apiCall("GET",    "/api/admin/payslips"); }
async function deletePayslip(id)         { return apiCall("DELETE", `/api/admin/payslips/${id}`); }

// ── Admin: Attendance ─────────────────────────────────────────
async function markAttendance(data)      { return apiCall("POST",   "/api/admin/attendance", data); }
async function getEmployeeAttendance(empId) { return apiCall("GET", `/api/admin/attendance/${empId}`); }

// ── Employee ──────────────────────────────────────────────────
async function getMyProfile()            { return apiCall("GET",    "/api/employee/profile"); }
async function getMyPayslips()           { return apiCall("GET",    "/api/employee/payslips"); }
async function getMyAttendance()         { return apiCall("GET",    "/api/employee/attendance"); }

// ── Expose globally ───────────────────────────────────────────
window.HRMS = {
  getToken, getUser, isAdmin, isEmployee, logout, requireAuth,
  handleLogin,
  getAllEmployees, addEmployee, updateEmployee, deleteEmployee, getAdminStats,
  uploadPayslip, getAllPayslips, deletePayslip,
  markAttendance, getEmployeeAttendance,
  getMyProfile, getMyPayslips, getMyAttendance
};

function showResetForm() {
    document.getElementById("resetBox").style.display = "block";
}

async function resetPassword() {
    const email = document.getElementById("resetEmail").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!email || !newPassword || !confirmPassword) {
        alert("All fields required");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, newPassword })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Password updated successfully!");
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("Error occurred");
    }
}

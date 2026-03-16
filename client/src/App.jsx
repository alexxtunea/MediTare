import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TeachersListPage from "./pages/TeachersListPage";
import TeacherDetailsPage from "./pages/TeacherDetailsPage";
import StudentDetailsPage from "./pages/StudentDetailsPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "teacher") {
    return <Navigate to="/dashboard/teacher" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <Navigate to="/dashboard/student" replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/teachers" element={<TeachersListPage />} />
          <Route path="/teachers/:id" element={<TeacherDetailsPage />} />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute>
                <StudentDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <StudentDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/teacher"
            element={
              <RoleRoute allowedRoles={["teacher"]}>
                <TeacherDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboardPage />
              </RoleRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

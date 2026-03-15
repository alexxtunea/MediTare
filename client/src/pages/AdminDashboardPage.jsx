import { useEffect, useState } from "react";
import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const getApiMessage = (error) =>
  error.response?.data?.message || "A apărut o eroare. Încearcă din nou.";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");

  const fetchAdminData = async () => {
    try {
      const [usersResponse, bookingsResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/bookings"),
      ]);

      setUsers(usersResponse.data);
      setBookings(bookingsResponse.data);
    } catch (fetchError) {
      setError(getApiMessage(fetchError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.delete(`/admin/users/${userId}`);
      setSuccess(data.message || "User-ul a fost șters.");
      await fetchAdminData();
    } catch (deleteError) {
      setError(getApiMessage(deleteError));
    } finally {
      setDeletingUserId("");
    }
  };

  if (loading) {
    return <Loader text="Se încarcă dashboard-ul de admin..." />;
  }

  return (
    <div className="page container">
      <section className="page-header">
        <p className="eyebrow">Dashboard admin</p>
        <h1>Bine ai venit, {user?.name}</h1>
        <p className="muted">Administrează utilizatorii și booking-urile platformei.</p>
      </section>

      <ErrorMessage message={error} />
      {success && <div className="message success-message">{success}</div>}

      <section className="admin-grid">
        <article className="card">
          <h2>Utilizatori</h2>
          {users.length ? (
            <div className="table-like">
              {users.map((listedUser) => (
                <div key={listedUser._id} className="table-row">
                  <div>
                    <strong>{listedUser.name}</strong>
                    <p className="muted">
                      {listedUser.email} · {listedUser.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button danger-button"
                    onClick={() => handleDeleteUser(listedUser._id)}
                    disabled={deletingUserId === listedUser._id}
                  >
                    {deletingUserId === listedUser._id ? "Se șterge..." : "Șterge"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="message info-message">Nu există utilizatori.</div>
          )}
        </article>

        <article className="card">
          <h2>Booking-uri</h2>
          {bookings.length ? (
            <div className="table-like">
              {bookings.map((booking) => (
                <div key={booking._id} className="table-row vertical-row">
                  <strong>
                    {booking.student?.name || "Student"} cu {booking.teacher?.name || "Profesor"}
                  </strong>
                  <p className="muted">
                    {booking.subject} · {booking.date} · {booking.timeSlot}
                  </p>
                  <p>
                    <strong>Status:</strong> {booking.status} / {booking.paymentStatus}
                  </p>
                  <p>
                    <strong>Preț:</strong> {booking.price} RON
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="message info-message">Nu există booking-uri.</div>
          )}
        </article>
      </section>
    </div>
  );
}

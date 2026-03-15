import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "student",
  subjects: "",
  description: "",
  profileImage: "",
  experienceLevel: "",
  teachesAt: "",
  sessionDuration: "",
  sessionType: "",
  groupSize: 1,
  pricePerSession: 0,
  availability: "",
};

const emptyBookingForm = {
  subject: "",
  date: "",
  timeSlot: "",
  price: 0,
  status: "pending_approval",
  paymentStatus: "unpaid",
};

const emptyReviewForm = {
  rating: 5,
  comment: "",
};

const getApiMessage = (error) =>
  error.response?.data?.message || "A apărut o eroare. Încearcă din nou.";

const bookingStatusLabels = {
  pending_approval: "În așteptarea aprobării",
  approved: "Upcoming / aprobată",
  pending_payment: "Aprobată",
  completed: "Finalizată",
  cancelled: "Anulată",
};

const paymentStatusLabels = {
  unpaid: "Neplătită",
  paid: "Plătită",
  failed: "Plată eșuată",
};

const formatAvailabilityForTextarea = (availability = []) =>
  Array.isArray(availability)
    ? availability.map((slot) => `${slot.day} | ${slot.start} | ${slot.end}`).join("\n")
    : "";

const parseAvailability = (availabilityText) =>
  availabilityText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, start, end] = line.split("|").map((part) => part.trim());
      return { day, start, end };
    })
    .filter((slot) => slot.day && slot.start && slot.end);

function AdminSection({ title, subtitle, children }) {
  return (
    <section className="card admin-section-card">
      <div className="admin-section-head">
        <div>
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [editingBookingId, setEditingBookingId] = useState(null);
  const [bookingForm, setBookingForm] = useState(emptyBookingForm);
  const [savingBooking, setSavingBooking] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState("");

  const fetchAdminData = async () => {
    try {
      const [usersResponse, bookingsResponse, reviewsResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/bookings"),
        api.get("/admin/reviews"),
      ]);

      setUsers(usersResponse.data);
      setBookings(bookingsResponse.data);
      setReviews(reviewsResponse.data);
    } catch (fetchError) {
      setError(getApiMessage(fetchError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const stats = useMemo(
    () => ({
      users: users.length,
      teachers: users.filter((listedUser) => listedUser.role === "teacher").length,
      bookings: bookings.length,
      pendingApprovals: bookings.filter((booking) => booking.status === "pending_approval").length,
      reviews: reviews.length,
    }),
    [users, bookings, reviews]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((listedUser) => {
      const matchesSearch = [listedUser.name, listedUser.email]
        .join(" ")
        .toLowerCase()
        .includes(userSearch.toLowerCase());
      const matchesRole =
        userRoleFilter === "all" ? true : listedUser.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        bookingStatusFilter === "all" ? true : booking.status === bookingStatusFilter
      ),
    [bookings, bookingStatusFilter]
  );

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
  };

  const handleUserChange = (event) => {
    setUserForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const startEditUser = (listedUser) => {
    setEditingUserId(listedUser._id);
    setUserForm({
      name: listedUser.name || "",
      email: listedUser.email || "",
      password: "",
      role: listedUser.role || "student",
      subjects: listedUser.subjects?.join(", ") || "",
      description: listedUser.description || "",
      profileImage: listedUser.profileImage || "",
      experienceLevel: listedUser.experienceLevel || "",
      teachesAt: listedUser.teachesAt || "",
      sessionDuration: listedUser.sessionDuration || "",
      sessionType: listedUser.sessionType || "",
      groupSize: listedUser.groupSize || 1,
      pricePerSession: listedUser.pricePerSession || 0,
      availability: formatAvailabilityForTextarea(listedUser.availability),
    });
    resetMessages();
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    setSavingUser(true);
    resetMessages();

    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        subjects: userForm.subjects.split(",").map((item) => item.trim()).filter(Boolean),
        description: userForm.description,
        profileImage: userForm.profileImage,
        experienceLevel: userForm.experienceLevel,
        teachesAt: userForm.teachesAt,
        sessionDuration: userForm.sessionDuration,
        sessionType: userForm.role === "teacher" ? userForm.sessionType : "",
        groupSize: userForm.role === "teacher" ? Number(userForm.groupSize) || 1 : 1,
        pricePerSession: userForm.role === "teacher" ? Number(userForm.pricePerSession) || 0 : 0,
        availability: userForm.role === "teacher" ? parseAvailability(userForm.availability) : [],
      };

      if (userForm.password) {
        payload.password = userForm.password;
      }

      if (editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, payload);
        setSuccess("Utilizatorul a fost actualizat.");
      } else {
        await api.post("/admin/users", payload);
        setSuccess("Utilizatorul a fost creat.");
      }

      resetUserForm();
      await fetchAdminData();
    } catch (submitError) {
      setError(getApiMessage(submitError));
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);
    resetMessages();

    try {
      const { data } = await api.delete(`/admin/users/${userId}`);
      setSuccess(data.message || "Utilizatorul a fost șters.");
      await fetchAdminData();
      if (editingUserId === userId) {
        resetUserForm();
      }
    } catch (deleteError) {
      setError(getApiMessage(deleteError));
    } finally {
      setDeletingUserId("");
    }
  };

  const handleBookingChange = (event) => {
    setBookingForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const startEditBooking = (booking) => {
    setEditingBookingId(booking._id);
    setBookingForm({
      subject: booking.subject || "",
      date: booking.date || "",
      timeSlot: booking.timeSlot || "",
      price: booking.price || 0,
      status: booking.status || "pending_approval",
      paymentStatus: booking.paymentStatus || "unpaid",
    });
    resetMessages();
  };

  const resetBookingForm = () => {
    setEditingBookingId(null);
    setBookingForm(emptyBookingForm);
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    if (!editingBookingId) {
      return;
    }

    setSavingBooking(true);
    resetMessages();

    try {
      await api.put(`/admin/bookings/${editingBookingId}`, {
        ...bookingForm,
        price: Number(bookingForm.price) || 0,
      });
      setSuccess("Booking-ul a fost actualizat.");
      resetBookingForm();
      await fetchAdminData();
    } catch (submitError) {
      setError(getApiMessage(submitError));
    } finally {
      setSavingBooking(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    setDeletingBookingId(bookingId);
    resetMessages();

    try {
      const { data } = await api.delete(`/admin/bookings/${bookingId}`);
      setSuccess(data.message || "Booking-ul a fost șters.");
      await fetchAdminData();
      if (editingBookingId === bookingId) {
        resetBookingForm();
      }
    } catch (deleteError) {
      setError(getApiMessage(deleteError));
    } finally {
      setDeletingBookingId("");
    }
  };

  const handleReviewChange = (event) => {
    setReviewForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({
      rating: review.rating || 5,
      comment: review.comment || "",
    });
    resetMessages();
  };

  const resetReviewForm = () => {
    setEditingReviewId(null);
    setReviewForm(emptyReviewForm);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!editingReviewId) {
      return;
    }

    setSavingReview(true);
    resetMessages();

    try {
      await api.put(`/admin/reviews/${editingReviewId}`, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setSuccess("Review-ul a fost actualizat.");
      resetReviewForm();
      await fetchAdminData();
    } catch (submitError) {
      setError(getApiMessage(submitError));
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setDeletingReviewId(reviewId);
    resetMessages();

    try {
      const { data } = await api.delete(`/admin/reviews/${reviewId}`);
      setSuccess(data.message || "Review-ul a fost șters.");
      await fetchAdminData();
      if (editingReviewId === reviewId) {
        resetReviewForm();
      }
    } catch (deleteError) {
      setError(getApiMessage(deleteError));
    } finally {
      setDeletingReviewId("");
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
        <p className="muted">
          Administrează utilizatorii, booking-urile și review-urile platformei într-un singur loc.
        </p>
      </section>

      <ErrorMessage message={error} />
      {success && <div className="message success-message">{success}</div>}

      <section className="admin-stats-grid">
        <article className="card admin-stat-card"><span>Total users</span><strong>{stats.users}</strong></article>
        <article className="card admin-stat-card"><span>Profesori</span><strong>{stats.teachers}</strong></article>
        <article className="card admin-stat-card"><span>Booking-uri</span><strong>{stats.bookings}</strong></article>
        <article className="card admin-stat-card"><span>În așteptare</span><strong>{stats.pendingApprovals}</strong></article>
        <article className="card admin-stat-card"><span>Review-uri</span><strong>{stats.reviews}</strong></article>
      </section>

      <div className="admin-toolbar">
        <button type="button" className={`button ${activeTab === "users" ? "" : "secondary-button"}`} onClick={() => setActiveTab("users")}>Utilizatori</button>
        <button type="button" className={`button ${activeTab === "bookings" ? "" : "secondary-button"}`} onClick={() => setActiveTab("bookings")}>Booking-uri</button>
        <button type="button" className={`button ${activeTab === "reviews" ? "" : "secondary-button"}`} onClick={() => setActiveTab("reviews")}>Review-uri</button>
      </div>

      {activeTab === "users" && (
        <div className="admin-grid-wide">
          <AdminSection title={editingUserId ? "Editează utilizator" : "Creează utilizator"} subtitle="CRUD complet pentru conturi de student, teacher și admin.">
            <form className="form" onSubmit={handleUserSubmit}>
              <div className="details-grid">
                <div className="form-group"><label htmlFor="user-name">Nume</label><input id="user-name" name="name" value={userForm.name} onChange={handleUserChange} required /></div>
                <div className="form-group"><label htmlFor="user-email">Email</label><input id="user-email" name="email" type="email" value={userForm.email} onChange={handleUserChange} required /></div>
              </div>
              <div className="details-grid">
                <div className="form-group"><label htmlFor="user-password">Parolă</label><input id="user-password" name="password" type="password" value={userForm.password} onChange={handleUserChange} placeholder={editingUserId ? "Lasă gol pentru a păstra parola" : "Parola inițială"} required={!editingUserId} /></div>
                <div className="form-group"><label htmlFor="user-role">Rol</label><select id="user-role" name="role" value={userForm.role} onChange={handleUserChange}><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select></div>
              </div>

              {userForm.role === "teacher" && (
                <>
                  <div className="form-group"><label htmlFor="user-subjects">Materii</label><input id="user-subjects" name="subjects" value={userForm.subjects} onChange={handleUserChange} placeholder="Ex: Matematică, Informatică" /></div>
                  <div className="form-group"><label htmlFor="user-description">Descriere</label><textarea id="user-description" name="description" rows="4" value={userForm.description} onChange={handleUserChange} /></div>
                  <div className="details-grid">
                    <div className="form-group"><label htmlFor="user-experience">Experiență</label><input id="user-experience" name="experienceLevel" value={userForm.experienceLevel} onChange={handleUserChange} /></div>
                    <div className="form-group"><label htmlFor="user-teachesAt">Instituție</label><input id="user-teachesAt" name="teachesAt" value={userForm.teachesAt} onChange={handleUserChange} /></div>
                  </div>
                  <div className="details-grid">
                    <div className="form-group"><label htmlFor="user-duration">Durata ședinței</label><input id="user-duration" name="sessionDuration" value={userForm.sessionDuration} onChange={handleUserChange} /></div>
                    <div className="form-group"><label htmlFor="user-sessionType">Tip</label><select id="user-sessionType" name="sessionType" value={userForm.sessionType} onChange={handleUserChange}><option value="">Selectează</option><option value="individual">Individual</option><option value="group">Grupă</option></select></div>
                    <div className="form-group"><label htmlFor="user-groupSize">Mărime grupă</label><input id="user-groupSize" type="number" min="1" name="groupSize" value={userForm.groupSize} onChange={handleUserChange} /></div>
                  </div>
                  <div className="details-grid">
                    <div className="form-group"><label htmlFor="user-price">Preț</label><input id="user-price" type="number" min="0" name="pricePerSession" value={userForm.pricePerSession} onChange={handleUserChange} /></div>
                    <div className="form-group"><label htmlFor="user-image">Poză profil</label><input id="user-image" name="profileImage" value={userForm.profileImage} onChange={handleUserChange} placeholder="https://..." /></div>
                  </div>
                  <div className="form-group"><label htmlFor="user-availability">Disponibilitate</label><textarea id="user-availability" name="availability" rows="5" value={userForm.availability} onChange={handleUserChange} placeholder={"Ex:\nMonday | 10:00 | 12:00\nWednesday | 14:00 | 16:00"} /></div>
                </>
              )}

              <div className="card-actions">
                <button type="submit" className="button" disabled={savingUser}>{savingUser ? "Se salvează..." : editingUserId ? "Actualizează utilizatorul" : "Creează utilizatorul"}</button>
                <button type="button" className="button secondary-button" onClick={resetUserForm}>Reset</button>
              </div>
            </form>
          </AdminSection>

          <AdminSection title="Utilizatori" subtitle="Caută, filtrează, editează sau șterge conturi.">
            <div className="admin-filters">
              <input type="text" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Caută după nume sau email" />
              <select value={userRoleFilter} onChange={(event) => setUserRoleFilter(event.target.value)}><option value="all">Toate rolurile</option><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select>
            </div>
            <div className="table-like">
              {filteredUsers.map((listedUser) => (
                <div key={listedUser._id} className="table-row admin-table-row">
                  <div>
                    <strong>{listedUser.name}</strong>
                    <p className="muted">{listedUser.email} · {listedUser.role}</p>
                  </div>
                  <div className="card-actions">
                    <button type="button" className="button secondary-button" onClick={() => startEditUser(listedUser)}>Edit</button>
                    <button type="button" className="button danger-button" onClick={() => handleDeleteUser(listedUser._id)} disabled={deletingUserId === listedUser._id}>{deletingUserId === listedUser._id ? "Se șterge..." : "Delete"}</button>
                  </div>
                </div>
              ))}
            </div>
          </AdminSection>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="admin-grid-wide">
          <AdminSection title="Editează booking" subtitle="Actualizează manual statusurile și datele unei rezervări.">
            {editingBookingId ? (
              <form className="form" onSubmit={handleBookingSubmit}>
                <div className="details-grid">
                  <div className="form-group"><label htmlFor="booking-subject">Materie</label><input id="booking-subject" name="subject" value={bookingForm.subject} onChange={handleBookingChange} /></div>
                  <div className="form-group"><label htmlFor="booking-date">Data</label><input id="booking-date" name="date" value={bookingForm.date} onChange={handleBookingChange} /></div>
                </div>
                <div className="details-grid">
                  <div className="form-group"><label htmlFor="booking-timeSlot">Interval</label><input id="booking-timeSlot" name="timeSlot" value={bookingForm.timeSlot} onChange={handleBookingChange} /></div>
                  <div className="form-group"><label htmlFor="booking-price">Preț</label><input id="booking-price" type="number" min="0" name="price" value={bookingForm.price} onChange={handleBookingChange} /></div>
                </div>
                <div className="details-grid">
                  <div className="form-group"><label htmlFor="booking-status">Status booking</label><select id="booking-status" name="status" value={bookingForm.status} onChange={handleBookingChange}><option value="pending_approval">pending_approval</option><option value="approved">approved</option><option value="pending_payment">pending_payment</option><option value="completed">completed</option><option value="cancelled">cancelled</option></select></div>
                  <div className="form-group"><label htmlFor="booking-payment">Status plată</label><select id="booking-payment" name="paymentStatus" value={bookingForm.paymentStatus} onChange={handleBookingChange}><option value="unpaid">unpaid</option><option value="paid">paid</option><option value="failed">failed</option></select></div>
                </div>
                <div className="card-actions">
                  <button type="submit" className="button" disabled={savingBooking}>{savingBooking ? "Se salvează..." : "Actualizează booking-ul"}</button>
                  <button type="button" className="button secondary-button" onClick={resetBookingForm}>Reset</button>
                </div>
              </form>
            ) : (
              <div className="message info-message">Selectează un booking din listă pentru a-l edita.</div>
            )}
          </AdminSection>

          <AdminSection title="Booking-uri" subtitle="Vezi toate rezervările și administrează-le.">
            <div className="admin-filters">
              <select value={bookingStatusFilter} onChange={(event) => setBookingStatusFilter(event.target.value)}>
                <option value="all">Toate statusurile</option>
                <option value="pending_approval">În așteptarea aprobării</option>
                <option value="approved">Upcoming / aprobată</option>
                <option value="pending_payment">Aprobată</option>
                <option value="completed">Finalizată</option>
                <option value="cancelled">Anulată</option>
              </select>
            </div>
            <div className="table-like">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="table-row vertical-row admin-booking-row">
                  <strong>{booking.student?.name || "Student"} cu {booking.teacher?.name || "Profesor"}</strong>
                  <p className="muted">{booking.subject} · {booking.date} · {booking.timeSlot}</p>
                  <p><strong>Status:</strong> {bookingStatusLabels[booking.status] || booking.status}</p>
                  <p><strong>Plată:</strong> {paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus}</p>
                  <div className="card-actions">
                    <button type="button" className="button secondary-button" onClick={() => startEditBooking(booking)}>Edit</button>
                    <button type="button" className="button danger-button" onClick={() => handleDeleteBooking(booking._id)} disabled={deletingBookingId === booking._id}>{deletingBookingId === booking._id ? "Se șterge..." : "Delete"}</button>
                  </div>
                </div>
              ))}
            </div>
          </AdminSection>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="admin-grid-wide">
          <AdminSection title="Editează review" subtitle="Corectează rating-ul sau comentariul când este nevoie.">
            {editingReviewId ? (
              <form className="form" onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label htmlFor="review-rating">Rating</label>
                  <select id="review-rating" name="rating" value={reviewForm.rating} onChange={handleReviewChange}>
                    <option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="review-comment">Comentariu</label>
                  <textarea id="review-comment" name="comment" rows="4" value={reviewForm.comment} onChange={handleReviewChange} />
                </div>
                <div className="card-actions">
                  <button type="submit" className="button" disabled={savingReview}>{savingReview ? "Se salvează..." : "Actualizează review-ul"}</button>
                  <button type="button" className="button secondary-button" onClick={resetReviewForm}>Reset</button>
                </div>
              </form>
            ) : (
              <div className="message info-message">Selectează un review din listă pentru a-l edita.</div>
            )}
          </AdminSection>

          <AdminSection title="Review-uri" subtitle="Administrează feedback-ul lăsat de studenți.">
            <div className="table-like">
              {reviews.map((review) => (
                <div key={review._id} className="table-row vertical-row admin-booking-row">
                  <strong>{review.student?.name || "Student"} → {review.teacher?.name || "Profesor"}</strong>
                  <p className="muted">{review.booking?.subject || "Materie"} · rating {review.rating}</p>
                  <p>{review.comment || "Fără comentariu"}</p>
                  <div className="card-actions">
                    <button type="button" className="button secondary-button" onClick={() => startEditReview(review)}>Edit</button>
                    <button type="button" className="button danger-button" onClick={() => handleDeleteReview(review._id)} disabled={deletingReviewId === review._id}>{deletingReviewId === review._id ? "Se șterge..." : "Delete"}</button>
                  </div>
                </div>
              ))}
            </div>
          </AdminSection>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import BookingCard from "../components/BookingCard";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const emptyReviewForm = {
  rating: "",
  comment: "",
};

const getApiMessage = (error) =>
  error.response?.data?.message || "A apărut o eroare. Încearcă din nou.";

const getBookingDateValue = (booking) => {
  if (!booking?.date) {
    return null;
  }

  const parsedDate = new Date(`${booking.date}T23:59:59`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const isPastBooking = (booking) => {
  const bookingDate = getBookingDateValue(booking);
  return bookingDate ? bookingDate < new Date() : false;
};

const splitBookings = (bookings) => {
  const normalizedBookings = bookings.map((booking) => ({
    ...booking,
    isPast: isPastBooking(booking),
  }));

  return {
    completed: normalizedBookings.filter(
      (booking) =>
        (booking.status === "completed" && booking.isPast) ||
        ((booking.status === "approved" || booking.status === "pending_payment") && booking.isPast)
    ),
    pendingApproval: normalizedBookings.filter(
      (booking) => booking.status === "pending_approval"
    ),
    upcoming: normalizedBookings.filter(
      (booking) =>
        (booking.status === "approved" ||
          booking.status === "pending_payment" ||
          booking.status === "completed") &&
        !booking.isPast
    ),
  };
};

function BookingSection({ title, description, bookings, emptyMessage, children }) {
  return (
    <section className="dashboard-section card">
      <div className="dashboard-section-head">
        <div>
          <h2>{title}</h2>
          <p className="muted">{description}</p>
        </div>
        <span className="badge">{bookings.length}</span>
      </div>

      {bookings.length ? children : <div className="message info-message">{emptyMessage}</div>}
    </section>
  );
}

export default function StudentDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: "",
    profileImage: "",
    age: "",
    educationLevel: "",
    description: "",
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeReviewBookingId, setActiveReviewBookingId] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [actionLoading, setActionLoading] = useState("");
  const [paymentSimulation, setPaymentSimulation] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchBookings = async () => {
    try {
      const [profileResponse, bookingsResponse] = await Promise.all([
        api.get("/auth/me"),
        api.get("/bookings/my-bookings"),
      ]);

      setProfileForm({
        name: profileResponse.data.name || "",
        profileImage: profileResponse.data.profileImage || "",
        age: profileResponse.data.age || "",
        educationLevel: profileResponse.data.educationLevel || "",
        description: profileResponse.data.description || "",
      });
      setBookings(bookingsResponse.data);
    } catch (fetchError) {
      setError(getApiMessage(fetchError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const groupedBookings = useMemo(() => splitBookings(bookings), [bookings]);

  const handleProfileChange = (event) => {
    setProfileForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSavingProfile(true);

    try {
      await api.put("/users/profile", {
        name: profileForm.name,
        profileImage: profileForm.profileImage,
        age: profileForm.age ? Number(profileForm.age) : null,
        educationLevel: profileForm.educationLevel,
        description: profileForm.description,
      });

      await refreshUser();
      setSuccess("Profilul studentului a fost actualizat.");
      await fetchBookings();
    } catch (submitError) {
      setError(getApiMessage(submitError));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePay = async (bookingId) => {
    setError("");
    setSuccess("");
    setActionLoading(`pay-${bookingId}`);
    setPaymentSimulation("Inițializăm plata securizată...");

    try {
      await wait(700);
      setPaymentSimulation("Verificăm aprobarea profesorului...");
      await wait(700);
      setPaymentSimulation("Confirmăm tranzacția cu procesatorul...");
      await wait(900);

      const { data } = await api.put(`/payments/${bookingId}/pay`);
      setSuccess(data.message || "Plata a fost procesată cu succes.");
      setPaymentSimulation("");
      await fetchBookings();
    } catch (paymentError) {
      setError(getApiMessage(paymentError));
      setPaymentSimulation("");
    } finally {
      setActionLoading("");
    }
  };

  const handleToggleReview = (bookingId) => {
    setError("");
    setSuccess("");
    setReviewForm(emptyReviewForm);
    setActiveReviewBookingId((prev) => (prev === bookingId ? null : bookingId));
  };

  const handleReviewChange = (event) => {
    setReviewForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleReviewSubmit = async (event, booking) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(`review-${booking._id}`);

    try {
      await api.post("/reviews", {
        teacher: booking.teacher?._id,
        booking: booking._id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      setSuccess("Review-ul a fost adăugat cu succes.");
      setActiveReviewBookingId(null);
      setReviewForm(emptyReviewForm);
      await fetchBookings();
    } catch (reviewError) {
      setError(getApiMessage(reviewError));
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return <Loader text="Se încarcă booking-urile..." />;
  }

  return (
    <div className="page container">
      <section className="page-header">
        <p className="eyebrow">Dashboard student</p>
        <h1>Bine ai venit, {user?.name}</h1>
        <p className="muted">{user?.email}</p>
      </section>

      <ErrorMessage message={error} />
      {success && <div className="message success-message">{success}</div>}
      {paymentSimulation && <div className="message payment-message">{paymentSimulation}</div>}

      <section className="card dashboard-profile-card">
        <h2>Profilul meu</h2>
        <form className="form" onSubmit={handleProfileSubmit}>
          <div className="details-grid">
            <div className="form-group">
              <label htmlFor="student-name">Nume și prenume</label>
              <input
                id="student-name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="student-image">URL poză profil</label>
              <input
                id="student-image"
                name="profileImage"
                value={profileForm.profileImage}
                onChange={handleProfileChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="details-grid">
            <div className="form-group">
              <label htmlFor="student-age">Vârstă</label>
              <input
                id="student-age"
                type="number"
                min="5"
                max="100"
                name="age"
                value={profileForm.age}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="student-level">Nivel de studiu</label>
              <input
                id="student-level"
                name="educationLevel"
                value={profileForm.educationLevel}
                onChange={handleProfileChange}
                placeholder="Ex: Clasa a IX-a / a X-a / a XI-a / a XII-a"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="student-description">Despre mine</label>
            <textarea
              id="student-description"
              name="description"
              rows="4"
              value={profileForm.description}
              onChange={handleProfileChange}
              placeholder="Spune pe scurt cine ești, ce obiective ai și cum preferi să înveți."
            />
          </div>

          {profileForm.profileImage && (
            <div className="profile-preview">
              <img
                src={profileForm.profileImage}
                alt="Preview profil student"
                className="profile-preview-image"
              />
            </div>
          )}

          <button type="submit" className="button" disabled={savingProfile}>
            {savingProfile ? "Se salvează..." : "Salvează profilul"}
          </button>
        </form>
      </section>

      <div className="dashboard-sections">
        <BookingSection
          title="Ședințe upcoming"
          description="Ședințe aprobate de profesor și programate pentru perioada următoare."
          bookings={groupedBookings.upcoming}
          emptyMessage="Nu ai ședințe upcoming în acest moment."
        >
          <div className="stack">
            {groupedBookings.upcoming.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                variant="student"
                currentUserId={user?._id}
                onPay={handlePay}
                onToggleReview={handleToggleReview}
                activeReviewBookingId={activeReviewBookingId}
                reviewForm={reviewForm}
                onReviewChange={handleReviewChange}
                onReviewSubmit={handleReviewSubmit}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </BookingSection>

        <BookingSection
          title="Ședințe care așteaptă aprobare"
          description="Aceste rezervări vor trece la upcoming doar după ce profesorul le acceptă."
          bookings={groupedBookings.pendingApproval}
          emptyMessage="Nu ai rezervări care așteaptă aprobare."
        >
          <div className="stack">
            {groupedBookings.pendingApproval.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                variant="student"
                currentUserId={user?._id}
                onPay={handlePay}
                onToggleReview={handleToggleReview}
                activeReviewBookingId={activeReviewBookingId}
                reviewForm={reviewForm}
                onReviewChange={handleReviewChange}
                onReviewSubmit={handleReviewSubmit}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </BookingSection>

        <BookingSection
          title="Ședințe finalizate"
          description="Aici găsești ședințele care s-au încheiat și pentru care poți lăsa review."
          bookings={groupedBookings.completed}
          emptyMessage="Nu ai încă ședințe finalizate."
        >
          <div className="stack">
            {groupedBookings.completed.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                variant="student"
                currentUserId={user?._id}
                onPay={handlePay}
                onToggleReview={handleToggleReview}
                activeReviewBookingId={activeReviewBookingId}
                reviewForm={reviewForm}
                onReviewChange={handleReviewChange}
                onReviewSubmit={handleReviewSubmit}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </BookingSection>
      </div>
    </div>
  );
}

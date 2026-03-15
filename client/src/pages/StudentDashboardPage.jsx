import { useEffect, useState } from "react";
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

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeReviewBookingId, setActiveReviewBookingId] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [actionLoading, setActionLoading] = useState("");
  const [paymentSimulation, setPaymentSimulation] = useState("");

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchBookings = async () => {
    try {
      const { data } = await api.get("/bookings/my-bookings");
      setBookings(data);
    } catch (fetchError) {
      setError(getApiMessage(fetchError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePay = async (bookingId) => {
    setError("");
    setSuccess("");
    setActionLoading(`pay-${bookingId}`);
    setPaymentSimulation("Inițializăm plata securizată...");

    try {
      await wait(700);
      setPaymentSimulation("Verificăm datele booking-ului...");
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

      <section className="stack">
        {bookings.length ? (
          bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onPay={handlePay}
              onToggleReview={handleToggleReview}
              activeReviewBookingId={activeReviewBookingId}
              reviewForm={reviewForm}
              onReviewChange={handleReviewChange}
              onReviewSubmit={handleReviewSubmit}
              actionLoading={actionLoading}
            />
          ))
        ) : (
          <div className="message info-message">
            Nu ai booking-uri momentan. Poți începe din pagina cu profesori.
          </div>
        )}
      </section>
    </div>
  );
}

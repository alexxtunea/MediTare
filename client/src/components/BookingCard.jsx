const formatSessionType = (teacher) => {
  if (teacher?.sessionType === "group") {
    return `Grupă, până la ${teacher.groupSize || 2} persoane`;
  }

  return "Individual";
};

export default function BookingCard({
  booking,
  onPay,
  onToggleReview,
  activeReviewBookingId,
  reviewForm,
  onReviewChange,
  onReviewSubmit,
  actionLoading,
}) {
  const canReview =
    booking.paymentStatus === "paid" || booking.status === "completed";
  const showReviewForm = activeReviewBookingId === booking._id;

  return (
    <article className="card booking-card">
      <div className="booking-meta">
        <div>
          <h3>{booking.teacher?.name || "Profesor"}</h3>
          <p className="muted">{booking.subject}</p>
        </div>
        <div className="booking-statuses">
          <span className="badge">{booking.status}</span>
          <span className="badge subtle-badge">{booking.paymentStatus}</span>
        </div>
      </div>

      <div className="details-grid">
        <p>
          <strong>Data:</strong> {booking.date}
        </p>
        <p>
          <strong>Interval:</strong> {booking.timeSlot}
        </p>
        <p>
          <strong>Preț:</strong> {booking.price} RON
        </p>
        <p>
          <strong>Tip:</strong> {formatSessionType(booking.teacher)}
        </p>
        <p>
          <strong>Durată:</strong> {booking.teacher?.sessionDuration || "Nespecificată"}
        </p>
      </div>

      <div className="card-actions">
        {booking.paymentStatus === "unpaid" && (
          <button
            type="button"
            className="button"
            onClick={() => onPay(booking._id)}
            disabled={actionLoading === `pay-${booking._id}`}
          >
            {actionLoading === `pay-${booking._id}` ? "Se procesează..." : "Plătește acum"}
          </button>
        )}

        {canReview && (
          <button
            type="button"
            className="button secondary-button"
            onClick={() => onToggleReview(booking._id)}
          >
            {showReviewForm ? "Anulează review-ul" : "Adaugă review"}
          </button>
        )}
      </div>

      {showReviewForm && (
        <form className="inline-form review-form" onSubmit={(event) => onReviewSubmit(event, booking)}>
          <div className="form-group">
            <label htmlFor={`rating-${booking._id}`}>Rating</label>
            <select
              id={`rating-${booking._id}`}
              name="rating"
              value={reviewForm.rating}
              onChange={onReviewChange}
              required
            >
              <option value="">Selectează</option>
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor={`comment-${booking._id}`}>Comentariu</label>
            <textarea
              id={`comment-${booking._id}`}
              name="comment"
              value={reviewForm.comment}
              onChange={onReviewChange}
              rows="3"
              placeholder="Spune pe scurt cum a fost ședința."
            />
          </div>

          <button
            type="submit"
            className="button"
            disabled={actionLoading === `review-${booking._id}`}
          >
            {actionLoading === `review-${booking._id}` ? "Se salvează..." : "Trimite review-ul"}
          </button>
        </form>
      )}
    </article>
  );
}

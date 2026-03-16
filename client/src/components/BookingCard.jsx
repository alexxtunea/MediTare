const formatSessionType = (teacher) => {
  if (teacher?.sessionType === "group") {
    return `Grupă, până la ${teacher.groupSize || 2} persoane`;
  }

  return "Individual";
};

const statusLabels = {
  pending_approval: "În așteptarea aprobării",
  approved: "Aprobată",
  pending_payment: "Aprobată",
  completed: "Finalizată",
  cancelled: "Anulată",
};

const paymentLabels = {
  unpaid: "Neplătită",
  paid: "Plătită",
  failed: "Plată eșuată",
};

export default function BookingCard({
  booking,
  variant = "student",
  onPay,
  onApprove,
  onToggleReview,
  activeReviewBookingId,
  reviewForm,
  onReviewChange,
  onReviewSubmit,
  actionLoading,
}) {
  const canReview =
    variant === "student" &&
    !booking.hasReview &&
    booking.paymentStatus === "paid" &&
    (booking.status === "completed" || booking.isPast);

  const canPay =
    variant === "student" &&
    (booking.status === "approved" || booking.status === "pending_payment") &&
    booking.paymentStatus === "unpaid";

  const canApprove =
    variant === "teacher" && booking.status === "pending_approval";

  const showReviewForm = activeReviewBookingId === booking._id;
  const counterpart =
    variant === "teacher"
      ? booking.student?.name || "Student"
      : booking.teacher?.name || "Profesor";
  const counterpartMeta =
    variant === "teacher" ? booking.student?.email : booking.subject;

  return (
    <article className="card booking-card">
      <div className="booking-meta">
        <div>
          <h3>{counterpart}</h3>
          <p className="muted">{counterpartMeta}</p>
        </div>
        <div className="booking-statuses">
          <span className="badge">{statusLabels[booking.status] || booking.status}</span>
          <span className="badge subtle-badge">
            {paymentLabels[booking.paymentStatus] || booking.paymentStatus}
          </span>
        </div>
      </div>

      <div className="details-grid">
        {variant === "teacher" && (
          <p>
            <strong>Materie:</strong> {booking.subject}
          </p>
        )}
        {variant === "student" && (
          <p>
            <strong>Profesor:</strong> {booking.teacher?.name || "Profesor"}
          </p>
        )}
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
        {canApprove && (
          <button
            type="button"
            className="button"
            onClick={() => onApprove(booking._id)}
            disabled={actionLoading === `approve-${booking._id}`}
          >
            {actionLoading === `approve-${booking._id}` ? "Se aprobă..." : "Acceptă ședința"}
          </button>
        )}

        {canPay && (
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

        {variant === "student" && booking.hasReview && (
          <span className="badge subtle-badge">Review adăugat</span>
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

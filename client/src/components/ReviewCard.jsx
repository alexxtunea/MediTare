export default function ReviewCard({ review }) {
  return (
    <article className="card review-card">
      <div className="card-header">
        <h3>{review.student?.name || "Student"}</h3>
        <span className="badge">{review.rating} / 5</span>
      </div>
      <p className="card-text">{review.comment || "Fara comentariu."}</p>
      <p className="muted small-text">
        {new Date(review.createdAt).toLocaleDateString("ro-RO")}
      </p>
    </article>
  );
}

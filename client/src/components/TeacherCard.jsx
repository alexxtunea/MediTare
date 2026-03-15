import { Link } from "react-router-dom";

const formatSubjects = (subjects = []) => {
  if (!subjects.length) {
    return "Materii nespecificate";
  }

  return subjects.join(", ");
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const formatSessionType = (teacher) => {
  if (teacher.sessionType === "group") {
    return `Grupă de până la ${teacher.groupSize || 2} persoane`;
  }

  return "Ședință individuală";
};

export default function TeacherCard({ teacher }) {
  return (
    <article className="card teacher-card">
      <div className="teacher-card-top">
        <div className="teacher-avatar-wrap">
          {teacher.profileImage ? (
            <img src={teacher.profileImage} alt={teacher.name} className="teacher-avatar" />
          ) : (
            <div className="teacher-avatar teacher-avatar-fallback">
              {getInitials(teacher.name)}
            </div>
          )}
        </div>
        <span className="badge">{teacher.averageRating?.toFixed(1) || "0.0"} / 5</span>
      </div>

      <div className="card-header">
        <div>
          <h3>{teacher.name}</h3>
          <p className="muted">{formatSubjects(teacher.subjects)}</p>
        </div>
      </div>

      <div className="teacher-description-block">
        <p className="teacher-description-line">
          <strong>Experiență:</strong> {teacher.experienceLevel || "Nespecificată"}
        </p>
        <p className="teacher-description-line">
          <strong>Instituție / loc de muncă:</strong> {teacher.teachesAt || "Nespecificat"}
        </p>
        <p className="teacher-description-line">
          <strong>Tip ședință:</strong> {formatSessionType(teacher)}
        </p>
        <p className="teacher-description-line">
          <strong>Durată:</strong> {teacher.sessionDuration || "Nespecificată"}
        </p>
      </div>

      <p className="card-text">
        {teacher.description || "Profesor disponibil pentru sesiuni personalizate."}
      </p>

      <div className="card-footer">
        <strong>{teacher.pricePerSession || 0} RON / ședință</strong>
        <Link className="button secondary-button" to={`/teachers/${teacher._id}`}>
          Vezi profilul
        </Link>
      </div>
    </article>
  );
}

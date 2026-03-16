import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";

const getApiMessage = (error) =>
  error.response?.data?.message || "A apărut o eroare. Încearcă din nou.";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function StudentDetailsPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await api.get(`/users/students/${id}`);
        setStudent(data);
      } catch (fetchError) {
        setError(getApiMessage(fetchError));
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return <Loader text="Se încarcă profilul studentului..." />;
  }

  if (error) {
    return (
      <div className="page container">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="page container">
      <section className="teacher-hero card">
        <div className="teacher-profile-head teacher-profile-head-full">
          <p className="eyebrow">Profil student</p>
          <h1>{student.name}</h1>
        </div>

        <div className="teacher-hero-main">
          <div className="teacher-profile-visual">
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.name}
                className="teacher-profile-image teacher-profile-image-large"
              />
            ) : (
              <div className="teacher-profile-image teacher-avatar-fallback teacher-profile-image-large">
                {getInitials(student.name)}
              </div>
            )}
          </div>

          <div className="teacher-info-box teacher-description-box">
            <p className="card-text teacher-description-text">
              {student.description ||
                "Studentul nu a adăugat încă o descriere personală."}
            </p>
          </div>
        </div>

        <div className="teacher-summary">
          <div className="teacher-info-box">
            <strong>Nume complet:</strong> {student.name}
          </div>
          <div className="teacher-info-box">
            <strong>Vârstă:</strong> {student.age ? `${student.age} ani` : "Nespecificată"}
          </div>
          <div className="teacher-info-box">
            <strong>Nivel de studiu:</strong>{" "}
            {student.educationLevel || "Nespecificat"}
          </div>
          <div className="teacher-info-box">
            <strong>Email:</strong> {student.email}
          </div>
        </div>
      </section>
    </div>
  );
}

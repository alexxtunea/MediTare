import { useEffect, useState } from "react";
import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import TeacherCard from "../components/TeacherCard";

const getApiMessage = (error) =>
  error.response?.data?.message || "Nu am putut încărca profesorii.";

export default function TeachersListPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data } = await api.get("/users/teachers");
        setTeachers(data);
      } catch (fetchError) {
        setError(getApiMessage(fetchError));
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div className="page container">
      <section className="page-header">
        <p className="eyebrow">Profesori</p>
        <h1>Lista profesorilor disponibili</h1>
        <p className="muted">
          Explorează profilurile și vezi concret experiența, instituția și formatul ședințelor.
        </p>
      </section>

      <ErrorMessage message={error} />

      {loading ? (
        <Loader text="Se încarcă profesorii..." />
      ) : teachers.length ? (
        <div className="cards-grid">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher._id} teacher={teacher} />
          ))}
        </div>
      ) : (
        <div className="message info-message">Nu există profesori disponibili momentan.</div>
      )}
    </div>
  );
}

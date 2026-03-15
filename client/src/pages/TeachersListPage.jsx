import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import TeacherCard from "../components/TeacherCard";

const getApiMessage = (error) =>
  error.response?.data?.message || "Nu am putut încărca profesorii.";

const normalizeSearchText = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function TeachersListPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    subject: "",
    maxPrice: "",
    minRating: "0",
    institution: "",
    sortBy: "rating",
  });

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

  const filteredTeachers = useMemo(() => {
    const normalizedSubject = normalizeSearchText(filters.subject);
    const normalizedInstitution = normalizeSearchText(filters.institution);
    const maxPrice = Number(filters.maxPrice) || Infinity;
    const minRating = Number(filters.minRating) || 0;

    const result = teachers.filter((teacher) => {
      const teacherSubjects = normalizeSearchText((teacher.subjects || []).join(" "));
      const teacherInstitution = normalizeSearchText(teacher.teachesAt || "");
      const subjectMatches =
        !normalizedSubject || teacherSubjects.includes(normalizedSubject);
      const institutionMatches =
        !normalizedInstitution || teacherInstitution.includes(normalizedInstitution);
      const priceMatches = (teacher.pricePerSession || 0) <= maxPrice;
      const ratingMatches = (teacher.averageRating || 0) >= minRating;

      return subjectMatches && institutionMatches && priceMatches && ratingMatches;
    });

    if (filters.sortBy === "price-asc") {
      return [...result].sort(
        (first, second) => (first.pricePerSession || 0) - (second.pricePerSession || 0)
      );
    }

    if (filters.sortBy === "price-desc") {
      return [...result].sort(
        (first, second) => (second.pricePerSession || 0) - (first.pricePerSession || 0)
      );
    }

    return [...result].sort(
      (first, second) => (second.averageRating || 0) - (first.averageRating || 0)
    );
  }, [filters, teachers]);

  const resultsLabel =
    filteredTeachers.length === 1
      ? "1 tutor găsit"
      : `${filteredTeachers.length} tutori găsiți`;

  const handleChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <div className="teachers-page">
      <section className="teachers-hero">
        <div className="container">
          <div className="teachers-hero-copy">
            <div className="hero-pill teachers-hero-pill">Explorează</div>
            <h1>Găsește tutorul perfect</h1>
            <p>
              {teachers.length} tutori disponibili • filtrează după materie, preț,
              rating și instituție.
            </p>
          </div>
        </div>
      </section>

      <section className="teachers-filter-wrap">
        <div className="container">
          <div className="teachers-filter-bar">
            <div className="filter-field wide-field">
              <label htmlFor="subject">Materie</label>
              <input
                id="subject"
                name="subject"
                value={filters.subject}
                onChange={handleChange}
                placeholder="ex: Matematică, Engleză..."
              />
            </div>

            <div className="filter-field">
              <label htmlFor="maxPrice">Preț max (RON)</label>
              <input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="ex: 150"
              />
            </div>

            <div className="filter-field">
              <label htmlFor="minRating">Rating minim</label>
              <select
                id="minRating"
                name="minRating"
                value={filters.minRating}
                onChange={handleChange}
              >
                <option value="0">Orice</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="institution">Instituție</label>
              <input
                id="institution"
                name="institution"
                value={filters.institution}
                onChange={handleChange}
                placeholder="ex: București / Universitate"
              />
            </div>

            <div className="filter-field filter-button-field">
              <button type="button" className="button filter-button">
                Caută
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container teachers-results-area">
        <ErrorMessage message={error} />

        {loading ? (
          <Loader text="Se încarcă profesorii..." />
        ) : (
          <>
            <div className="teachers-results-meta">
              <p>{resultsLabel}</p>
              <div className="teachers-sort">
                <label htmlFor="sortBy">Sortare:</label>
                <select id="sortBy" name="sortBy" value={filters.sortBy} onChange={handleChange}>
                  <option value="rating">Rating</option>
                  <option value="price-asc">Preț crescător</option>
                  <option value="price-desc">Preț descrescător</option>
                </select>
              </div>
            </div>

            {filteredTeachers.length ? (
              <div className="cards-grid teacher-results-grid">
                {filteredTeachers.map((teacher) => (
                  <TeacherCard key={teacher._id} teacher={teacher} />
                ))}
              </div>
            ) : (
              <div className="message info-message">
                Nu există profesori care să corespundă filtrelor alese.
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

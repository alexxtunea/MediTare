import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const getApiMessage = (error) =>
  error.response?.data?.message || "A apărut o eroare. Încearcă din nou.";

const formatAvailabilityForTextarea = (availability = []) => {
  if (!Array.isArray(availability) || !availability.length) {
    return "";
  }

  return availability.map((slot) => `${slot.day} | ${slot.start} | ${slot.end}`).join("\n");
};

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

export default function TeacherDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    profileImage: "",
    subjects: "",
    description: "",
    experienceLevel: "",
    teachesAt: "",
    sessionDuration: "",
    sessionType: "individual",
    groupSize: 1,
    pricePerSession: 0,
    availability: "",
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const parsedSubjects = useMemo(
    () =>
      formData.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean),
    [formData.subjects]
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileResponse, bookingsResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/bookings/teacher"),
        ]);

        const profile = profileResponse.data;

        setFormData({
          name: profile.name || "",
          profileImage: profile.profileImage || "",
          subjects: profile.subjects?.join(", ") || "",
          description: profile.description || "",
          experienceLevel: profile.experienceLevel || "",
          teachesAt: profile.teachesAt || "",
          sessionDuration: profile.sessionDuration || "",
          sessionType: profile.sessionType || "individual",
          groupSize: profile.groupSize || 1,
          pricePerSession: profile.pricePerSession || 0,
          availability: formatAvailabilityForTextarea(profile.availability),
        });
        setBookings(bookingsResponse.data);
      } catch (fetchError) {
        setError(getApiMessage(fetchError));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.put("/users/teacher/profile", {
        name: formData.name,
        profileImage: formData.profileImage,
        subjects: parsedSubjects,
        description: formData.description,
        experienceLevel: formData.experienceLevel,
        teachesAt: formData.teachesAt,
        sessionDuration: formData.sessionDuration,
        sessionType: formData.sessionType,
        groupSize:
          formData.sessionType === "group" ? Number(formData.groupSize) || 2 : 1,
        pricePerSession: Number(formData.pricePerSession),
        availability: parseAvailability(formData.availability),
      });

      await refreshUser();
      setSuccess("Profilul profesorului a fost actualizat.");
    } catch (submitError) {
      setError(getApiMessage(submitError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text="Se încarcă dashboard-ul profesorului..." />;
  }

  return (
    <div className="page container">
      <section className="page-header">
        <p className="eyebrow">Dashboard profesor</p>
        <h1>Bine ai venit, {user?.name}</h1>
        <p className="muted">
          Completează profilul astfel încât elevii să vadă clar experiența,
          durata ședinței și dacă lucrezi individual sau în grupă.
        </p>
      </section>

      <ErrorMessage message={error} />
      {success && <div className="message success-message">{success}</div>}

      <section className="content-split">
        <article className="card">
          <h2>Editare profil</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nume</label>
              <input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="profileImage">URL poză profil</label>
              <input
                id="profileImage"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="subjects">Materii</label>
              <input
                id="subjects"
                name="subjects"
                value={formData.subjects}
                onChange={handleChange}
                placeholder="Ex: Matematică, Fizică"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descriere</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="experienceLevel">Experiență</label>
              <input
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                placeholder="Ex: Profesor de matematică de 8 ani / Student laborant"
              />
            </div>

            <div className="form-group">
              <label htmlFor="teachesAt">Instituție / loc de muncă</label>
              <input
                id="teachesAt"
                name="teachesAt"
                value={formData.teachesAt}
                onChange={handleChange}
                placeholder="Ex: Universitatea București / Colegiul Național X"
              />
            </div>

            <div className="details-grid">
              <div className="form-group">
                <label htmlFor="sessionDuration">Durata unei ședințe</label>
                <input
                  id="sessionDuration"
                  name="sessionDuration"
                  value={formData.sessionDuration}
                  onChange={handleChange}
                  placeholder="Ex: 1 oră și 30 min / 2 ore"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sessionType">Tipul ședinței</label>
                <select
                  id="sessionType"
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleChange}
                >
                  <option value="individual">Individual</option>
                  <option value="group">Grupă</option>
                </select>
              </div>
            </div>

            {formData.sessionType === "group" && (
              <div className="form-group">
                <label htmlFor="groupSize">Număr maxim persoane în grupă</label>
                <input
                  id="groupSize"
                  type="number"
                  min="2"
                  name="groupSize"
                  value={formData.groupSize}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="pricePerSession">Preț pe ședință</label>
              <input
                id="pricePerSession"
                type="number"
                min="0"
                name="pricePerSession"
                value={formData.pricePerSession}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="availability">Disponibilitate</label>
              <textarea
                id="availability"
                name="availability"
                rows="6"
                value={formData.availability}
                onChange={handleChange}
                placeholder={"Ex:\nLuni | 10:00 | 12:00\nMiercuri | 14:00 | 16:00"}
              />
              <small className="helper-text">
                Câte un interval pe linie, în formatul zi | start | end.
              </small>
            </div>

            {formData.profileImage && (
              <div className="profile-preview">
                <img src={formData.profileImage} alt="Preview profesor" className="profile-preview-image" />
              </div>
            )}

            <button type="submit" className="button" disabled={saving}>
              {saving ? "Se salvează..." : "Salvează profilul"}
            </button>
          </form>
        </article>

        <article className="card">
          <h2>Booking-uri primite</h2>
          {bookings.length ? (
            <div className="stack">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-list-item">
                  <h3>{booking.student?.name || "Student"}</h3>
                  <p className="muted">{booking.student?.email}</p>
                  <p>
                    <strong>Materie:</strong> {booking.subject}
                  </p>
                  <p>
                    <strong>Data:</strong> {booking.date}
                  </p>
                  <p>
                    <strong>Interval:</strong> {booking.timeSlot}
                  </p>
                  <p>
                    <strong>Status:</strong> {booking.status} / {booking.paymentStatus}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="message info-message">
              Nu există booking-uri pentru acest profesor momentan.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import BookingCard from "../components/BookingCard";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const getApiMessage = (error) =>
  error.response?.data?.message || "A apărut o eroare. Încearcă din nou.";

const dayLabels = {
  monday: "Luni",
  tuesday: "Marți",
  wednesday: "Miercuri",
  thursday: "Joi",
  friday: "Vineri",
  saturday: "Sâmbătă",
  sunday: "Duminică",
};

const reverseDayLabels = {
  luni: "Monday",
  marți: "Tuesday",
  marti: "Tuesday",
  miercuri: "Wednesday",
  joi: "Thursday",
  vineri: "Friday",
  sâmbătă: "Saturday",
  sambata: "Saturday",
  duminică: "Sunday",
  duminica: "Sunday",
};

const formatDayLabel = (value = "") => {
  const normalized = value.trim().toLowerCase();
  return dayLabels[normalized] || value;
};

const normalizeDayForSave = (value = "") => {
  const normalized = value.trim().toLowerCase();
  return reverseDayLabels[normalized] || value;
};

const formatAvailabilityForTextarea = (availability = []) => {
  if (!Array.isArray(availability) || !availability.length) {
    return "";
  }

  return availability
    .map((slot) => `${formatDayLabel(slot.day)} | ${slot.start} | ${slot.end}`)
    .join("\n");
};

const parseAvailability = (availabilityText) =>
  availabilityText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, start, end] = line.split("|").map((part) => part.trim());
      return { day: normalizeDayForSave(day), start, end };
    })
    .filter((slot) => slot.day && slot.start && slot.end);

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
    teacher: {
      sessionType: booking.teacher?.sessionType || "individual",
      sessionDuration: booking.teacher?.sessionDuration || "",
      groupSize: booking.teacher?.groupSize || 1,
      ...booking.teacher,
    },
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
  const [actionLoading, setActionLoading] = useState("");

  const parsedSubjects = useMemo(
    () =>
      formData.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean),
    [formData.subjects]
  );

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const groupedBookings = useMemo(() => splitBookings(bookings), [bookings]);

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

  const handleApprove = async (bookingId) => {
    setActionLoading(`approve-${bookingId}`);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.put(`/bookings/${bookingId}/approve`);
      setSuccess(data.message || "Ședința a fost aprobată.");
      await fetchDashboardData();
    } catch (approveError) {
      setError(getApiMessage(approveError));
    } finally {
      setActionLoading("");
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
          Administrează-ți profilul și aprobă ședințele care trebuie să intre în upcoming.
        </p>
      </section>

      <ErrorMessage message={error} />
      {success && <div className="message success-message">{success}</div>}

      <section className="card dashboard-profile-card">
        <h2>Editare profil</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="details-grid">
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

          <div className="details-grid">
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
      </section>

      <div className="dashboard-sections">
        <BookingSection
          title="Ședințe upcoming"
          description="Ședințele aprobate care urmează să aibă loc."
          bookings={groupedBookings.upcoming}
          emptyMessage="Nu ai ședințe upcoming momentan."
        >
          <div className="stack">
            {groupedBookings.upcoming.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                variant="teacher"
                onApprove={handleApprove}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </BookingSection>

        <BookingSection
          title="Ședințe care așteaptă aprobare"
          description="Aceste rezervări intră la upcoming doar după ce le accepți."
          bookings={groupedBookings.pendingApproval}
          emptyMessage="Nu ai ședințe care așteaptă aprobare."
        >
          <div className="stack">
            {groupedBookings.pendingApproval.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                variant="teacher"
                onApprove={handleApprove}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </BookingSection>

        <BookingSection
          title="Ședințe finalizate"
          description="Ședințele încheiate sau cele a căror dată a trecut."
          bookings={groupedBookings.completed}
          emptyMessage="Nu ai încă ședințe finalizate."
        >
          <div className="stack">
            {groupedBookings.completed.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                variant="teacher"
                onApprove={handleApprove}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </BookingSection>
      </div>
    </div>
  );
}

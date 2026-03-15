import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import ReviewCard from "../components/ReviewCard";
import { useAuth } from "../context/AuthContext";

const emptyBookingForm = {
  subject: "",
  date: "",
  timeSlot: "",
};

const getApiMessage = (error) =>
  error.response?.data?.message || "A apărut o eroare. Încearcă din nou.";

const dayAliases = {
  luni: "monday",
  monday: "monday",
  mon: "monday",
  marti: "tuesday",
  marți: "tuesday",
  tuesday: "tuesday",
  tue: "tuesday",
  miercuri: "wednesday",
  wednesday: "wednesday",
  wed: "wednesday",
  joi: "thursday",
  thursday: "thursday",
  thu: "thursday",
  vineri: "friday",
  friday: "friday",
  fri: "friday",
  sambata: "saturday",
  sâmbătă: "saturday",
  saturday: "saturday",
  sat: "saturday",
  duminica: "sunday",
  duminică: "sunday",
  sunday: "sunday",
  sun: "sunday",
};

const normalizeDayName = (value = "") =>
  dayAliases[value.trim().toLowerCase()] || "";

const getCanonicalDayFromDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  return normalizeDayName(
    new Date(dateValue).toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "UTC",
    })
  );
};

const formatAvailability = (availability = []) => {
  if (!Array.isArray(availability) || !availability.length) {
    return [];
  }

  return availability.map((slot) => ({
    dayKey: normalizeDayName(slot.day),
    label: `${slot.day}: ${slot.start} - ${slot.end}`,
    value: `${slot.day}: ${slot.start} - ${slot.end}`,
  }));
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const formatSessionType = (teacher) => {
  if (teacher?.sessionType === "group") {
    return `Grupă de până la ${teacher.groupSize || 2} persoane`;
  }

  return "Ședință individuală";
};

export default function TeacherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [bookingForm, setBookingForm] = useState(emptyBookingForm);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDayHint, setSelectedDayHint] = useState("");

  const availabilityOptions = useMemo(
    () => formatAvailability(teacher?.availability),
    [teacher]
  );

  const filteredAvailabilityOptions = useMemo(() => {
    if (!bookingForm.date) {
      return availabilityOptions;
    }

    const selectedDay = getCanonicalDayFromDate(bookingForm.date);
    return availabilityOptions.filter((slot) => slot.dayKey === selectedDay);
  }, [availabilityOptions, bookingForm.date]);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const [teacherResponse, reviewsResponse] = await Promise.all([
          api.get(`/users/teachers/${id}`),
          api.get(`/reviews/teacher/${id}`),
        ]);

        setTeacher(teacherResponse.data);
        setReviews(reviewsResponse.data);
        setBookingForm({
          subject: teacherResponse.data.subjects?.[0] || "",
          date: "",
          timeSlot: "",
        });
      } catch (fetchError) {
        setPageError(getApiMessage(fetchError));
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [id]);

  const handleBookingChange = (event) => {
    const { name, value } = event.target;

    if (name === "date") {
      const canonicalDay = getCanonicalDayFromDate(value);
      const matchingSlots = availabilityOptions.filter(
        (slot) => slot.dayKey === canonicalDay
      );

      setSelectedDayHint(
        value
          ? new Date(value).toLocaleDateString("ro-RO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })
          : ""
      );

      setBookingForm((prev) => ({
        ...prev,
        date: value,
        timeSlot: matchingSlots[0]?.value || "",
      }));

      return;
    }

    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      await api.post("/bookings", {
        teacher: teacher._id,
        subject: bookingForm.subject,
        date: bookingForm.date,
        timeSlot: bookingForm.timeSlot,
      });

      setBookingSuccess("Booking-ul a fost creat cu succes.");
      navigate("/dashboard/student");
    } catch (submitError) {
      setBookingError(getApiMessage(submitError));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Se încarcă profilul profesorului..." />;
  }

  if (pageError) {
    return (
      <div className="page container">
        <ErrorMessage message={pageError} />
      </div>
    );
  }

  return (
    <div className="page container">
      <section className="teacher-hero card">
        <div className="teacher-hero-main">
          <div className="teacher-profile-head">
            {teacher.profileImage ? (
              <img src={teacher.profileImage} alt={teacher.name} className="teacher-profile-image" />
            ) : (
              <div className="teacher-profile-image teacher-avatar-fallback large-avatar">
                {getInitials(teacher.name)}
              </div>
            )}
            <div>
              <p className="eyebrow">Profil profesor</p>
              <h1>{teacher.name}</h1>
            </div>
          </div>
          <p className="card-text">
            {teacher.description || "Profesor disponibil pentru sesiuni personalizate."}
          </p>
        </div>

        <div className="teacher-summary">
          <p>
            <strong>Materii:</strong>{" "}
            {teacher.subjects?.length ? teacher.subjects.join(", ") : "Nespecificate"}
          </p>
          <p>
            <strong>Preț:</strong> {teacher.pricePerSession || 0} RON / ședință
          </p>
          <p>
            <strong>Rating mediu:</strong> {teacher.averageRating?.toFixed(1) || "0.0"} (
            {teacher.ratingsCount || 0} review-uri)
          </p>
          <p>
            <strong>Experiență:</strong> {teacher.experienceLevel || "Nespecificată"}
          </p>
          <p>
            <strong>Instituție / loc de muncă:</strong> {teacher.teachesAt || "Nu a menționat"}
          </p>
          <p>
            <strong>Durata unei ședințe:</strong> {teacher.sessionDuration || "Nespecificată"}
          </p>
          <p>
            <strong>Tipul ședinței:</strong> {formatSessionType(teacher)}
          </p>
        </div>
      </section>

      <section className="content-split">
        <div className="stack">
          <article className="card">
            <h2>Disponibilitate</h2>
            {availabilityOptions.length ? (
              <ul className="simple-list">
                {availabilityOptions.map((option) => (
                  <li key={option.value}>{option.label}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Profesorul nu a adăugat încă intervale disponibile.</p>
            )}
          </article>

          <article className="card">
            <h2>Review-uri</h2>
            {reviews.length ? (
              <div className="stack">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ) : (
              <p className="muted">Nu există review-uri momentan.</p>
            )}
          </article>
        </div>

        <aside className="card sticky-card">
          <h2>Rezervă o ședință</h2>
          <p className="muted">
            Vezi clar dacă ședința este individuală sau în grupă înainte de rezervare.
          </p>

          <div className="session-highlight">
            <p>
              <strong>Format:</strong> {formatSessionType(teacher)}
            </p>
            <p>
              <strong>Durată:</strong> {teacher.sessionDuration || "Nespecificată"}
            </p>
          </div>

          <ErrorMessage message={bookingError} />
          {bookingSuccess && <div className="message success-message">{bookingSuccess}</div>}

          {user?.role === "student" ? (
            <form className="form" onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label htmlFor="subject">Materie</label>
                <select
                  id="subject"
                  name="subject"
                  value={bookingForm.subject}
                  onChange={handleBookingChange}
                  required
                >
                  <option value="">Selectează materia</option>
                  {(teacher.subjects || []).map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Data</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={bookingForm.date}
                  onChange={handleBookingChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                {selectedDayHint && (
                  <small className="helper-text">Ziua selectată: {selectedDayHint}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="timeSlot">Interval</label>
                {filteredAvailabilityOptions.length ? (
                  <select
                    id="timeSlot"
                    name="timeSlot"
                    value={bookingForm.timeSlot}
                    onChange={handleBookingChange}
                    required
                  >
                    <option value="">Selectează intervalul</option>
                    {filteredAvailabilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="message info-message">
                    {bookingForm.date
                      ? "Profesorul nu are un slot disponibil în ziua aleasă."
                      : "Alege mai întâi o dată pentru a vedea sloturile corecte."}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="button"
                disabled={bookingLoading || !filteredAvailabilityOptions.length}
              >
                {bookingLoading ? "Se trimite..." : "Rezervă ședința"}
              </button>
            </form>
          ) : (
            <p className="muted">
              Pentru booking trebuie să fii autentificat ca student.
            </p>
          )}
        </aside>
      </section>
    </div>
  );
}

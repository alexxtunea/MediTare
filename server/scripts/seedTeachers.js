const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

dotenv.config();

const demoTeachers = [
  {
    name: "Andrei Popescu",
    email: "andrei.popescu@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Matematică", "Informatică"],
    description:
      "Lucrez calm și structurat, cu accent pe logică, claritate și pregătire serioasă pentru examene.",
    profileImage: "https://i.pravatar.cc/300?img=12",
    experienceLevel: "Profesor de liceu, 8 ani experiență",
    teachesAt: "Colegiu național din București",
    sessionDuration: "2 ore",
    sessionType: "individual",
    groupSize: 1,
    pricePerSession: 140,
    availability: [
      { day: "Monday", start: "16:00", end: "18:00" },
      { day: "Wednesday", start: "17:00", end: "19:00" },
      { day: "Saturday", start: "10:00", end: "13:00" },
    ],
  },
  {
    name: "Bianca Ionescu",
    email: "bianca.ionescu@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Limba română", "Istorie"],
    description:
      "Lucrez cu explicații clare, scheme utile și recapitulări eficiente pentru elevii care vor progres rapid.",
    profileImage: "https://i.pravatar.cc/300?img=32",
    experienceLevel: "Profesor și evaluator, 6 ani experiență",
    teachesAt: "Centru educațional privat",
    sessionDuration: "90 de minute",
    sessionType: "group",
    groupSize: 4,
    pricePerSession: 120,
    availability: [
      { day: "Tuesday", start: "15:00", end: "17:00" },
      { day: "Thursday", start: "16:00", end: "18:00" },
      { day: "Sunday", start: "11:00", end: "13:00" },
    ],
  },
  {
    name: "Cătălin Dumitrescu",
    email: "catalin.dumitrescu@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Fizică", "Matematică"],
    description:
      "Explic intuitiv și transform materia tehnică în pași ușor de urmărit, fără să las goluri în înțelegere.",
    profileImage: "https://i.pravatar.cc/300?img=15",
    experienceLevel: "Asistent universitar și meditator",
    teachesAt: "Facultate tehnică și online",
    sessionDuration: "2 ore",
    sessionType: "individual",
    groupSize: 1,
    pricePerSession: 150,
    availability: [
      { day: "Monday", start: "18:00", end: "20:00" },
      { day: "Friday", start: "16:00", end: "18:00" },
      { day: "Saturday", start: "09:00", end: "11:00" },
    ],
  },
  {
    name: "Elena Marin",
    email: "elena.marin@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Biologie", "Chimie"],
    description:
      "Predau într-un stil prietenos, orientat spre înțelegere și consolidare pentru Bac și admitere.",
    profileImage: "https://i.pravatar.cc/300?img=47",
    experienceLevel: "Profesor titular, 10 ani experiență",
    teachesAt: "Liceu și pregătire individuală",
    sessionDuration: "90 de minute",
    sessionType: "group",
    groupSize: 3,
    pricePerSession: 135,
    availability: [
      { day: "Wednesday", start: "15:00", end: "17:00" },
      { day: "Friday", start: "17:00", end: "19:00" },
      { day: "Sunday", start: "10:00", end: "12:00" },
    ],
  },
  {
    name: "Radu Stoica",
    email: "radu.stoica@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Informatică", "Programare"],
    description:
      "Te ajut să treci de la teorie la exerciții aplicate și proiecte mici, într-un mod clar și practic.",
    profileImage: "https://i.pravatar.cc/300?img=53",
    experienceLevel: "Inginer software și mentor tehnic",
    teachesAt: "Companie IT și sesiuni private",
    sessionDuration: "3 ore",
    sessionType: "group",
    groupSize: 5,
    pricePerSession: 170,
    availability: [
      { day: "Tuesday", start: "18:00", end: "20:00" },
      { day: "Thursday", start: "18:00", end: "20:00" },
      { day: "Saturday", start: "12:00", end: "15:00" },
    ],
  },
  {
    name: "Sorina Pavel",
    email: "sorina.pavel@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Engleză", "Franceză"],
    description:
      "Construiesc lecții clare pentru conversație, gramatică și pregătire pentru examene, adaptate ritmului tău.",
    profileImage: "https://i.pravatar.cc/300?img=44",
    experienceLevel: "Profesor și trainer lingvistic",
    teachesAt: "Școală de limbi străine",
    sessionDuration: "1 oră și 30 de minute",
    sessionType: "individual",
    groupSize: 1,
    pricePerSession: 125,
    availability: [
      { day: "Monday", start: "15:00", end: "17:00" },
      { day: "Thursday", start: "15:00", end: "17:00" },
      { day: "Saturday", start: "11:00", end: "13:00" },
    ],
  },
  {
    name: "Mara Georgescu",
    email: "mara.georgescu@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Geografie", "Istorie"],
    description:
      "Lucrez foarte bine pe sinteze, hărți conceptuale și recapitulări pentru Bac și Evaluare.",
    profileImage: "https://i.pravatar.cc/300?img=5",
    experienceLevel: "Profesor de gimnaziu și liceu, 7 ani experiență",
    teachesAt: "Colegiu pedagogic",
    sessionDuration: "2 ore",
    sessionType: "group",
    groupSize: 4,
    pricePerSession: 110,
    availability: [
      { day: "Tuesday", start: "17:00", end: "19:00" },
      { day: "Friday", start: "15:00", end: "17:00" },
      { day: "Sunday", start: "09:00", end: "11:00" },
    ],
  },
  {
    name: "Vlad Neagu",
    email: "vlad.neagu@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Economie", "Matematică"],
    description:
      "Explic aplicat și clar, cu exemple reale și exerciții potrivite pentru elevii de profil economic.",
    profileImage: "https://i.pravatar.cc/300?img=67",
    experienceLevel: "Profesor și consultant educațional",
    teachesAt: "Liceu economic din Cluj-Napoca",
    sessionDuration: "2 ore",
    sessionType: "individual",
    groupSize: 1,
    pricePerSession: 145,
    availability: [
      { day: "Monday", start: "17:30", end: "19:30" },
      { day: "Wednesday", start: "18:00", end: "20:00" },
      { day: "Saturday", start: "10:00", end: "12:00" },
    ],
  },
  {
    name: "Ioana Petrescu",
    email: "ioana.petrescu@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Psihologie", "Logică"],
    description:
      "Predau într-un stil clar și empatic, potrivit pentru elevii care vor explicații bine structurate.",
    profileImage: "https://i.pravatar.cc/300?img=25",
    experienceLevel: "Profesor și consilier școlar, 5 ani experiență",
    teachesAt: "Colegiu național și cabinet educațional",
    sessionDuration: "1 oră și 30 de minute",
    sessionType: "individual",
    groupSize: 1,
    pricePerSession: 130,
    availability: [
      { day: "Tuesday", start: "16:00", end: "18:00" },
      { day: "Thursday", start: "17:00", end: "19:00" },
      { day: "Saturday", start: "12:00", end: "14:00" },
    ],
  },
  {
    name: "Darius Ene",
    email: "darius.ene@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Programare", "Baze de date"],
    description:
      "Lucrez foarte bine cu elevii și studenții care vor practică, algoritmică și proiecte complete cap-coadă.",
    profileImage: "https://i.pravatar.cc/300?img=60",
    experienceLevel: "Senior software engineer și mentor",
    teachesAt: "Companie de produs și workshop-uri private",
    sessionDuration: "2 ore și 30 de minute",
    sessionType: "group",
    groupSize: 6,
    pricePerSession: 180,
    availability: [
      { day: "Wednesday", start: "18:00", end: "20:30" },
      { day: "Friday", start: "18:00", end: "20:30" },
      { day: "Sunday", start: "11:00", end: "13:30" },
    ],
  },
  {
    name: "Ana Iliescu",
    email: "ana.iliescu@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Germană", "Engleză"],
    description:
      "Predau într-un stil dinamic și ordonat, cu accent pe conversație, vocabular și încredere la examene.",
    profileImage: "https://i.pravatar.cc/300?img=49",
    experienceLevel: "Profesor de limbi moderne, 9 ani experiență",
    teachesAt: "Centru lingvistic universitar",
    sessionDuration: "90 de minute",
    sessionType: "group",
    groupSize: 3,
    pricePerSession: 135,
    availability: [
      { day: "Monday", start: "14:00", end: "16:00" },
      { day: "Thursday", start: "16:00", end: "18:00" },
      { day: "Saturday", start: "09:30", end: "11:30" },
    ],
  },
];

const demoStudents = [
  {
    name: "Maria Tudor",
    email: "maria.tudor@student-demo.ro",
    password: "student123",
    profileImage: "https://i.pravatar.cc/300?img=9",
    age: 18,
    educationLevel: "Clasa a XII-a",
    description: "Mă pregătesc pentru Bac și caut ședințe clare, bine structurate și practice.",
  },
  {
    name: "Alex Rusu",
    email: "alex.rusu@student-demo.ro",
    password: "student123",
    profileImage: "https://i.pravatar.cc/300?img=13",
    age: 17,
    educationLevel: "Clasa a XI-a",
    description: "Îmi place să lucrez constant și caut profesori care explică aplicat și calm.",
  },
  {
    name: "Teodora Enache",
    email: "teodora.enache@student-demo.ro",
    password: "student123",
    profileImage: "https://i.pravatar.cc/300?img=21",
    age: 18,
    educationLevel: "Clasa a XII-a",
    description: "Sunt interesată de sinteze bune și de pregătire eficientă pentru examene.",
  },
  {
    name: "Victor Stan",
    email: "victor.stan@student-demo.ro",
    password: "student123",
    profileImage: "https://i.pravatar.cc/300?img=18",
    age: 16,
    educationLevel: "Clasa a X-a",
    description: "Încerc să recuperez materia și mă ajută mult ședințele pas cu pas.",
  },
  {
    name: "Ioana Dima",
    email: "ioana.dima@student-demo.ro",
    password: "student123",
    profileImage: "https://i.pravatar.cc/300?img=29",
    age: 17,
    educationLevel: "Clasa a XI-a",
    description: "Caut sesiuni interactive și îmi place să lucrez în grupuri mici când are sens.",
  },
];

const demoAdmin = {
  name: "Admin MediTare",
  email: "admin@email.com",
  password: "AdminMediTare",
  role: "admin",
};

const seededReviewData = [
  {
    teacherEmail: "andrei.popescu@meditare-demo.ro",
    studentEmail: "maria.tudor@student-demo.ro",
    rating: 5,
    comment: "Explică foarte clar și m-a ajutat mult la exercițiile pentru Bac.",
    subject: "Matematică",
    date: "2026-02-10",
    timeSlot: "Luni: 16:00 - 18:00",
    reviewedAt: "2026-02-10T18:40:00.000Z",
  },
  {
    teacherEmail: "andrei.popescu@meditare-demo.ro",
    studentEmail: "alex.rusu@student-demo.ro",
    rating: 5,
    comment: "Foarte organizat și răbdător. Recomand pentru mate și informatică.",
    subject: "Informatică",
    date: "2026-02-17",
    timeSlot: "Miercuri: 17:00 - 19:00",
    reviewedAt: "2026-02-18T09:15:00.000Z",
  },
  {
    teacherEmail: "bianca.ionescu@meditare-demo.ro",
    studentEmail: "teodora.enache@student-demo.ro",
    rating: 4,
    comment: "Mi-au plăcut explicațiile și recapitulările pe opere și eseuri.",
    subject: "Limba română",
    date: "2026-02-12",
    timeSlot: "Joi: 16:00 - 18:00",
    reviewedAt: "2026-02-13T12:20:00.000Z",
  },
  {
    teacherEmail: "catalin.dumitrescu@meditare-demo.ro",
    studentEmail: "victor.stan@student-demo.ro",
    rating: 5,
    comment: "Explicațiile la fizică au fost foarte intuitive și bine structurate.",
    subject: "Fizică",
    date: "2026-02-14",
    timeSlot: "Vineri: 16:00 - 18:00",
    reviewedAt: "2026-02-15T11:05:00.000Z",
  },
  {
    teacherEmail: "elena.marin@meditare-demo.ro",
    studentEmail: "ioana.dima@student-demo.ro",
    rating: 5,
    comment: "Super clară la biologie, cu multe exemple utile pentru admitere.",
    subject: "Biologie",
    date: "2026-02-15",
    timeSlot: "Duminică: 10:00 - 12:00",
    reviewedAt: "2026-02-15T16:45:00.000Z",
  },
  {
    teacherEmail: "radu.stoica@meditare-demo.ro",
    studentEmail: "maria.tudor@student-demo.ro",
    rating: 4,
    comment: "Mi-au plăcut exercițiile practice și modul în care explică algoritmii.",
    subject: "Programare",
    date: "2026-02-18",
    timeSlot: "Joi: 18:00 - 20:00",
    reviewedAt: "2026-02-19T10:30:00.000Z",
  },
  {
    teacherEmail: "sorina.pavel@meditare-demo.ro",
    studentEmail: "alex.rusu@student-demo.ro",
    rating: 5,
    comment: "Foarte bună pentru conversație și gramatică. Lecția a fost fluidă și clară.",
    subject: "Engleză",
    date: "2026-02-16",
    timeSlot: "Luni: 15:00 - 17:00",
    reviewedAt: "2026-02-17T08:50:00.000Z",
  },
  {
    teacherEmail: "mara.georgescu@meditare-demo.ro",
    studentEmail: "teodora.enache@student-demo.ro",
    rating: 4,
    comment: "Mi-au plăcut sintezele și hărțile conceptuale pentru geografie.",
    subject: "Geografie",
    date: "2026-02-20",
    timeSlot: "Vineri: 15:00 - 17:00",
    reviewedAt: "2026-02-21T14:10:00.000Z",
  },
  {
    teacherEmail: "vlad.neagu@meditare-demo.ro",
    studentEmail: "victor.stan@student-demo.ro",
    rating: 5,
    comment: "Explică foarte bine și face conexiuni utile între teorie și practică.",
    subject: "Economie",
    date: "2026-02-21",
    timeSlot: "Sâmbătă: 10:00 - 12:00",
    reviewedAt: "2026-02-21T19:00:00.000Z",
  },
  {
    teacherEmail: "ioana.petrescu@meditare-demo.ro",
    studentEmail: "ioana.dima@student-demo.ro",
    rating: 5,
    comment: "Foarte empatică și clară. M-a ajutat mult la logică.",
    subject: "Logică",
    date: "2026-02-19",
    timeSlot: "Joi: 17:00 - 19:00",
    reviewedAt: "2026-02-20T13:35:00.000Z",
  },
  {
    teacherEmail: "darius.ene@meditare-demo.ro",
    studentEmail: "maria.tudor@student-demo.ro",
    rating: 5,
    comment: "Excelent pentru programare practică și proiecte mai serioase.",
    subject: "Baze de date",
    date: "2026-02-22",
    timeSlot: "Duminică: 11:00 - 13:30",
    reviewedAt: "2026-02-22T18:25:00.000Z",
  },
  {
    teacherEmail: "ana.iliescu@meditare-demo.ro",
    studentEmail: "alex.rusu@student-demo.ro",
    rating: 4,
    comment: "Foarte bună pentru vocabular și conversație. Explicații clare.",
    subject: "Germană",
    date: "2026-02-13",
    timeSlot: "Joi: 16:00 - 18:00",
    reviewedAt: "2026-02-14T09:40:00.000Z",
  },
  {
    teacherEmail: "bianca.ionescu@meditare-demo.ro",
    studentEmail: "maria.tudor@student-demo.ro",
    rating: 3,
    comment: "Explicațiile au fost utile, dar ritmul a fost puțin prea rapid pentru mine.",
    subject: "Istorie",
    date: "2026-02-23",
    timeSlot: "Duminică: 11:00 - 13:00",
    reviewedAt: "2026-02-24T10:00:00.000Z",
  },
  {
    teacherEmail: "bianca.ionescu@meditare-demo.ro",
    studentEmail: "victor.stan@student-demo.ro",
    rating: 2,
    comment: "Mi-ar fi plăcut mai multe exemple și o structură mai clară pe parcurs.",
    subject: "Limba română",
    date: "2026-02-24",
    timeSlot: "Marți: 15:00 - 17:00",
    reviewedAt: "2026-02-24T19:30:00.000Z",
  },
  {
    teacherEmail: "radu.stoica@meditare-demo.ro",
    studentEmail: "teodora.enache@student-demo.ro",
    rating: 3,
    comment: "Partea practică a fost bună, dar explicațiile inițiale au fost destul de grăbite.",
    subject: "Informatică",
    date: "2026-02-25",
    timeSlot: "Marți: 18:00 - 20:00",
    reviewedAt: "2026-02-26T08:20:00.000Z",
  },
  {
    teacherEmail: "mara.georgescu@meditare-demo.ro",
    studentEmail: "ioana.dima@student-demo.ro",
    rating: 3,
    comment: "Materialele au fost bune, însă aș fi vrut mai mult timp pentru întrebări.",
    subject: "Istorie",
    date: "2026-02-26",
    timeSlot: "Duminică: 09:00 - 11:00",
    reviewedAt: "2026-02-26T17:10:00.000Z",
  },
  {
    teacherEmail: "ana.iliescu@meditare-demo.ro",
    studentEmail: "maria.tudor@student-demo.ro",
    rating: 2,
    comment: "Ora a fost ok, dar ritmul a fost prea intens și nu am apucat să fixez tot.",
    subject: "Engleză",
    date: "2026-02-27",
    timeSlot: "Luni: 14:00 - 16:00",
    reviewedAt: "2026-02-28T11:55:00.000Z",
  },
  {
    teacherEmail: "vlad.neagu@meditare-demo.ro",
    studentEmail: "alex.rusu@student-demo.ro",
    rating: 3,
    comment: "Exemplele au fost bune, însă mi-ar fi prins bine mai multă structură la exerciții.",
    subject: "Matematică",
    date: "2026-02-28",
    timeSlot: "Miercuri: 18:00 - 20:00",
    reviewedAt: "2026-03-01T09:25:00.000Z",
  },
  {
    teacherEmail: "elena.marin@meditare-demo.ro",
    studentEmail: "victor.stan@student-demo.ro",
    rating: 4,
    comment: "Explică bine și clar, dar aș fi vrut puțin mai multe exerciții aplicate.",
    subject: "Chimie",
    date: "2026-03-01",
    timeSlot: "Vineri: 17:00 - 19:00",
    reviewedAt: "2026-03-02T15:05:00.000Z",
  },
  {
    teacherEmail: "darius.ene@meditare-demo.ro",
    studentEmail: "ioana.dima@student-demo.ro",
    rating: 3,
    comment: "Conținut bun, dar pentru nivelul meu a fost puțin prea dens într-o singură ședință.",
    subject: "Programare",
    date: "2026-03-02",
    timeSlot: "Vineri: 18:00 - 20:30",
    reviewedAt: "2026-03-03T10:45:00.000Z",
  },
];

const buildDateKey = ({ teacherEmail, studentEmail, subject, date, timeSlot }) =>
  [teacherEmail, studentEmail, subject, date, timeSlot].join("|");

const updateTeacherRatings = async () => {
  const teachers = await User.find({ role: "teacher" });

  for (const teacher of teachers) {
    const reviews = await Review.find({ teacher: teacher._id });
    const ratingsCount = reviews.length;
    const averageRating = ratingsCount
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / ratingsCount
      : 0;

    await User.findByIdAndUpdate(teacher._id, { averageRating, ratingsCount });
  }
};

const seedTeachers = async () => {
  await connectDB();

  const teacherMap = new Map();
  const studentMap = new Map();

  for (const teacher of demoTeachers) {
    const hashedPassword = await bcrypt.hash(teacher.password, 10);

    const savedTeacher = await User.findOneAndUpdate(
      { email: teacher.email },
      {
        ...teacher,
        password: hashedPassword,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    teacherMap.set(teacher.email, savedTeacher);
  }

  for (const student of demoStudents) {
    const hashedPassword = await bcrypt.hash(student.password, 10);

    const savedStudent = await User.findOneAndUpdate(
      { email: student.email },
      {
        ...student,
        role: "student",
        password: hashedPassword,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    studentMap.set(student.email, savedStudent);
  }

  {
    const hashedPassword = await bcrypt.hash(demoAdmin.password, 10);

    await User.findOneAndUpdate(
      { email: demoAdmin.email },
      {
        ...demoAdmin,
        password: hashedPassword,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  for (const seededReview of seededReviewData) {
    const teacher = teacherMap.get(seededReview.teacherEmail);
    const student = studentMap.get(seededReview.studentEmail);

    if (!teacher || !student) {
      continue;
    }

    const booking = await Booking.findOneAndUpdate(
      {
        student: student._id,
        teacher: teacher._id,
        subject: seededReview.subject,
        date: seededReview.date,
        timeSlot: seededReview.timeSlot,
      },
      {
        student: student._id,
        teacher: teacher._id,
        subject: seededReview.subject,
        date: seededReview.date,
        timeSlot: seededReview.timeSlot,
        price: teacher.pricePerSession || 0,
        status: "completed",
        paymentStatus: "paid",
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const review = await Review.findOneAndUpdate(
      {
        booking: booking._id,
        student: student._id,
      },
      {
        student: student._id,
        teacher: teacher._id,
        booking: booking._id,
        rating: seededReview.rating,
        comment: seededReview.comment,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (seededReview.reviewedAt) {
      const reviewedAt = new Date(seededReview.reviewedAt);
      await Review.collection.updateOne(
        { _id: review._id },
        {
          $set: {
            createdAt: reviewedAt,
            updatedAt: reviewedAt,
          },
        }
      );
    }
  }

  await updateTeacherRatings();

  console.log(
    `Seeded ${demoTeachers.length} demo teacher profiles, ${demoStudents.length} demo students, 1 demo admin and ${seededReviewData.length} demo reviews.`
  );
  await mongoose.connection.close();
};

seedTeachers().catch(async (error) => {
  console.error("Teacher seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});

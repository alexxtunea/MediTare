const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const demoTeachers = [
  {
    name: "Andrei Popescu",
    email: "andrei.popescu@meditare-demo.ro",
    password: "teacher123",
    role: "teacher",
    subjects: ["Matematică", "Informatică"],
    description:
      "Profesor calm și foarte structurat, cu accent pe logică, claritate și pregătire pentru examene.",
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
      "Lucrează foarte bine cu elevii care vor explicații clare, scheme și recapitulări eficiente.",
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
      "Explică intuitiv și transformă materia tehnică în pași ușor de urmărit pentru elevi.",
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
      "Are un stil prietenos, orientat spre înțelegere și consolidare pentru Bac și admitere.",
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
      "Perfect pentru elevii care vor să treacă de la teorie la exerciții aplicate și proiecte mici.",
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
      "Construiește lecții foarte clare pentru conversație, gramatică și pregătire pentru examene.",
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
];

const seedTeachers = async () => {
  await connectDB();

  for (const teacher of demoTeachers) {
    const hashedPassword = await bcrypt.hash(teacher.password, 10);

    await User.findOneAndUpdate(
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
  }

  console.log(`Seeded ${demoTeachers.length} demo teacher profiles.`);
  await mongoose.connection.close();
};

seedTeachers().catch(async (error) => {
  console.error("Teacher seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});

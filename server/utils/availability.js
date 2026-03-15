const DAY_ALIASES = {
  luni: "monday",
  monday: "monday",
  mon: "monday",
  marti: "tuesday",
  marți: "tuesday",
  tuesday: "tuesday",
  tue: "tuesday",
  tues: "tuesday",
  miercuri: "wednesday",
  wednesday: "wednesday",
  wed: "wednesday",
  joi: "thursday",
  thursday: "thursday",
  thu: "thursday",
  thur: "thursday",
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
  DAY_ALIASES[value.trim().toLowerCase()] || "";

const getCanonicalDayFromDate = (dateValue) => {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const englishDay = parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });

  return normalizeDayName(englishDay);
};

module.exports = {
  normalizeDayName,
  getCanonicalDayFromDate,
};

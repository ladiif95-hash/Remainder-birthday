export function daysUntilBirthday(dateValue) {
  const today = startOfDay(new Date());
  const birthday = new Date(dateValue);
  const nextBirthday = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  );

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  return Math.ceil((nextBirthday - today) / 86400000);
}

export function isBirthdayThisMonth(dateValue) {
  return new Date(dateValue).getMonth() === new Date().getMonth();
}

export function formatBirthday(dateValue) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
  }).format(new Date(dateValue));
}

export function formatFullBirthday(dateValue) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

export function turningAge(dateValue) {
  const today = startOfDay(new Date());
  const birthday = new Date(dateValue);
  let age = today.getFullYear() - birthday.getFullYear();
  const birthdayThisYear = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  );

  if (birthdayThisYear < today) {
    age += 1;
  }

  return Math.max(age, 0);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

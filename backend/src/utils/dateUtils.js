const isValidDateString = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime());
};

const isBeforeToday = (value) => {
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

module.exports = { isValidDateString, isBeforeToday };

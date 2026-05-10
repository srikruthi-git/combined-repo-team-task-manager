const validateLogin = (payload) => {
  const errors = [];

  if (!payload.username) {
    errors.push("Username is required");
  }

  if (!payload.password) {
    errors.push("Password is required");
  }

  return errors;
};

module.exports = { validateLogin };

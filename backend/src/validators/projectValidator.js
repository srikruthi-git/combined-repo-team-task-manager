const validateProject = (payload) => {
  const errors = [];

  if (!payload.name) {
    errors.push("Project name is required");
  }

  return errors;
};

module.exports = { validateProject };

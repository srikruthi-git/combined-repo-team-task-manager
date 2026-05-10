const { isValidDateString, isBeforeToday } = require("../utils/dateUtils");

const validStatuses = ["Todo", "In Progress", "Completed"];

const validateTask = (payload) => {
  const errors = [];

  if (!payload.projectId) {
    errors.push("Project is required");
  }

  if (!payload.title) {
    errors.push("Task title is required");
  }

  if (!payload.assignedTo) {
    errors.push("Assigned user is required");
  }

  if (payload.status && !validStatuses.includes(payload.status)) {
    errors.push("Invalid status value");
  }

  if (payload.dueDate) {
    if (!isValidDateString(payload.dueDate)) {
      errors.push("Due date must be a valid date");
    } else if (isBeforeToday(payload.dueDate)) {
      errors.push("Due date cannot be in the past");
    }
  }

  return errors;
};

const validateStatus = (status) => {
  if (!validStatuses.includes(status)) {
    return ["Invalid status value"];
  }
  return [];
};

module.exports = { validateTask, validateStatus, validStatuses };

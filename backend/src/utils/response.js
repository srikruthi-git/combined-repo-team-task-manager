const sendSuccess = (res, payload) => {
  res.json({ success: true, ...payload });
};

const sendError = (res, status, message) => {
  res.status(status).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };

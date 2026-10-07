function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  const statusCode = err.statusCode || err.response?.status || 500;
  const message = err.message || err.response?.data?.error || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };

import ErrorResponse from '../utils/errorResponse.js';

// Centralized error handler
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  const statusCode = error.statusCode || err.statusCode || 500;

  // Log only internal server errors (5xx) to console for dev
  if (statusCode >= 500) {
    console.error('💥 Server Error Intercepted:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: error.message || err.message || 'Server Error'
  });
};

// 404 Not Found handler
export const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

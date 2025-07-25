const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this information already exists',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

module.exports = errorHandler;
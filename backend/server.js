import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;

// Centralized Error Handlers (must be registered after API routes)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(` SevaSaathi Backend running on port ${PORT}`);
  console.log(`====================================================`);
});

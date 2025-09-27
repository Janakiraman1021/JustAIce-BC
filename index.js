import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB  from'./config/db.js'; // Ensure database connection is established
import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaint.js';


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors())
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

import { errorHandler } from './middleware/errorMiddleware.js';
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;

import express from 'express';
import connectDB from './db.js';

const app = express();

// Connect to MongoDB
connectDB();

app.get('/', (_req, res) => {
	res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

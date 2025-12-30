import mongoose from 'mongoose';
import { MONGO_URI } from './utils/config.js';

const connectDB = async () => {
	try {
		await mongoose.connect(MONGO_URI);
		console.log('MongoDB connected');
	} catch (err) {
		console.error(err);
		// Exit process with failure
		process.exit(1);
	}
};

export default connectDB;

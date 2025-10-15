import mongoose from 'mongoose';

const db = process.env.MONGO_URI;

const connectDB = async () => {
	try {
		await mongoose.connect(db);
		console.log('MongoDB connected');
	} catch (err) {
		console.error(err);
		// Exit process with failure
		process.exit(1);
	}
};

export default connectDB;

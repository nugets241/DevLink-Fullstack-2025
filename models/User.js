import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true }, // hashed
		headline: { type: String, trim: true, default: '' },
		location: { type: String, trim: true, default: '' },
		avatar: { type: String, default: '' },
	},
	{ timestamps: true },
);

// // Text search index for basic profile search
// UserSchema.index({ name: 'text', bio: 'text' });

export default mongoose.model('user', UserSchema);

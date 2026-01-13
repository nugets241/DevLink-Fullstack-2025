import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
		company: { type: String, trim: true },
		website: { type: String, trim: true },
		location: { type: String, trim: true },
		bio: { type: String, trim: true },
		status: { type: String, required: true, trim: true },
		skills: { type: [String], required: true },
		social: {
			youtube: { type: String, trim: true },
			x: { type: String, trim: true },
			facebook: { type: String, trim: true },
			linkedin: { type: String, trim: true },
			instagram: { type: String, trim: true },
		},
		githubusername: { type: String, trim: true },
		experience: [
			{
				title: { type: String, required: true, trim: true },
				company: { type: String, required: true, trim: true },
				location: { type: String, trim: true },
				from: { type: Date, required: true },
				to: { type: Date },
				current: { type: Boolean, default: false },
				description: { type: String, trim: true },
			},
		],
		education: [
			{
				school: { type: String, required: true, trim: true },
				degree: { type: String, required: true, trim: true },
				fieldofstudy: { type: String, required: true, trim: true },
				from: { type: Date, required: true },
				to: { type: Date },
				current: { type: Boolean, default: false },
				description: { type: String, trim: true },
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model('profile', ProfileSchema);

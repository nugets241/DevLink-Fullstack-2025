import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
		text: { type: String, required: true, trim: true },
		name: { type: String, trim: true },
		avatar: { type: String, trim: true },
		likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
		comments: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'user',
					required: true,
				},
				text: { type: String, required: true, trim: true },
				name: { type: String, trim: true },
				avatar: { type: String, trim: true },
				date: { type: Date, default: Date.now },
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model('post', PostSchema);

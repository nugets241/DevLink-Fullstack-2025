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
				editedAt: { type: Date },
			},
		],
	},
	{ timestamps: true },
);

// Performance indexes
// 1. Compound index for common query: "Get posts by user, newest first"
//    Supports: Post.find({ user: userId }).sort({ createdAt: -1 })
PostSchema.index({ user: 1, createdAt: -1 });

// 2. Index for sorting all posts by date (used in feed)
//    Supports: Post.find().sort({ createdAt: -1 })
PostSchema.index({ createdAt: -1 });

// 3. Index for finding posts with specific likes
//    Supports: Post.find({ likes: userId })
PostSchema.index({ likes: 1 });

export default mongoose.model('post', PostSchema);

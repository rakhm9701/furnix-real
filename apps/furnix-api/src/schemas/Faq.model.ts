// src/schemas/faq.schema.ts
import mongoose, { Schema } from 'mongoose';
import { FaqStatus, FaqCategory } from '../libs/enums/faq.enum';

const FaqSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},

		content: {
			type: String,
			required: true,
		},

		status: {
			type: String,
			enum: Object.values(FaqStatus),
			default: FaqStatus.ACTIVE,
		},

		category: {
			type: String,
			enum: Object.values(FaqCategory),
			default: FaqCategory.GENERAL,
			required: true,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		// For order/sorting
		order: {
			type: Number,
			default: 0,
		},

		// Track view count
		viewCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
		collection: 'faqs',
		// Add indexes for common queries
		indexes: [{ status: 1 }, { category: 1 }, { order: 1 }, { memberId: 1 }],
	},
);

// Add any methods or virtuals if needed
FaqSchema.methods = {
	incrementView: function () {
		this.viewCount += 1;
		return this.save();
	},
};

const FaqModel = mongoose.model('Faq', FaqSchema);
export { FaqSchema, FaqModel };

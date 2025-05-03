const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required']
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      required: [true, 'Status is required']
    },
    description: {
      type: String,
      trim: true
    },
    requirements: {
      type: String,
      trim: true
    },
    currency: {
      type: String,
      default: 'ALL',
      enum: ['ALL', 'EUR', 'USD'],
      required: [true, 'Currency is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for submissions
tenderSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'tenderId'
});

const Tender = mongoose.model('Tender', tenderSchema);

module.exports = Tender; 
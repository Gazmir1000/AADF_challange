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

// Auto-update status based on deadline
tenderSchema.pre('find', function() {
  this.where({ deadline: { $gt: new Date() }, status: 'open' });
});

tenderSchema.pre('findOne', function() {
  // Check and update status if deadline has passed
  this.where({ deadline: { $gt: new Date() }, status: 'open' });
});

const Tender = mongoose.model('Tender', tenderSchema);

module.exports = Tender; 
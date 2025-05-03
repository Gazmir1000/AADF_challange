const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: [true, 'Submission ID is required']
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Evaluator ID is required']
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score must be at least 0'],
      max: [100, 'Score must be at most 100']
    },
    comments: {
      type: String,
      trim: true
    },
    technicalScore: {
      type: Number,
      min: [0, 'Technical score must be at least 0'],
      max: [50, 'Technical score must be at most 50']
    },
    financialScore: {
      type: Number,
      min: [0, 'Financial score must be at least 0'],
      max: [50, 'Financial score must be at most 50']
    }
  },
  {
    timestamps: true
  }
);

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation; 
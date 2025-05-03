const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team member name is required']
  },
  experiences: {
    type: String,
    required: [true, 'Team member experience is required']
  },
  documents: {
    type: String,
    required: [true, 'Team member documents are required']
  }
});

const submissionSchema = new mongoose.Schema(
  {
    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tender',
      required: [true, 'Tender ID is required']
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor ID is required']
    },
    financialOffer: {
      type: Number,
      required: [true, 'Financial offer is required'],
      min: [0, 'Financial offer must be a positive number']
    },
    proposedTeam: {
      type: [teamMemberSchema],
      validate: {
        validator: function (team) {
          return team && team.length > 0;
        },
        message: 'At least one team member is required'
      }
    },
    declaration: {
      type: Boolean,
      required: [true, 'Declaration is required'],
      validate: {
        validator: function (value) {
          return value === true;
        },
        message: 'You must agree to the declaration'
      }
    },
    accuracyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    aiEvaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for evaluation
submissionSchema.virtual('evaluation', {
  ref: 'Evaluation',
  localField: '_id',
  foreignField: 'submissionId',
  justOne: true
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission; 
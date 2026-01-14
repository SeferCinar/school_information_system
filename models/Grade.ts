import mongoose, { Schema, model, models } from 'mongoose';

const GradeSchema = new Schema(
  {
    student_no: { type: String, required: true, index: true, ref: 'Student' },
    lecture_code: { type: String, required: true, index: true, ref: 'Lecture' },
    semester: { type: String, required: true },
    exam_scores: {
      type: Map,
      of: Number, // exam_type -> score (0-100)
      default: {},
    },
    letter_grade: { type: String }, // AA, BA, BB, CB, CC, DC, DD, FF
    entered_by: { type: String }, // lecturer_id or user.ref_id
    entered_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    updated_by: { type: String }, // For tracking who last updated
  },
  {
    versionKey: false,
    collection: 'Grade',
    timestamps: false, // We handle timestamps manually
  }
);

GradeSchema.index({ student_no: 1, lecture_code: 1, semester: 1 }, { unique: true });

const Grade = models.Grade || model('Grade', GradeSchema);
export default Grade;

import mongoose, { Schema, model, models } from 'mongoose';

const ExamSchema = new Schema(
  {
    lecture_code: { type: String, required: true, index: true, ref: 'Lecture' },
    semester: { type: String, required: true },
    exam_type: { type: String, required: true }, // e.g., 'Midterm', 'Final', 'Quiz', 'Homework'
    percentage: { type: Number, required: true, min: 0, max: 100 },
    exam_date: { type: Date, required: true },
    time: { type: String, required: true }, // Start time in HH:MM format (e.g., "14:30")
    duration: { type: Number, required: true, min: 1 }, // Duration in minutes
    lecturer_id: { type: String }, // user.ref_id
    lecturer_name: { type: String }, // user.name (for display)
  },
  {
    versionKey: false,
    collection: 'Exam',
    timestamps: true,
  }
);

ExamSchema.index({ lecture_code: 1, semester: 1, exam_type: 1 }, { unique: true });

const Exam = models.Exam || model('Exam', ExamSchema);
export default Exam;

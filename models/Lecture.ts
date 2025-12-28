import mongoose, { Schema, model, models } from 'mongoose';

const LectureSchema = new Schema({

  _id: { type: String, required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  akts: { type: Number, required: true },
  department: { type: String, required: true },
  type: { type: String, enum: ['Mandatory', 'Elective'], default: 'Mandatory' },
  language: { type: String, default: 'English' },
  prerequisites: { type: [String], default: [] },
  info: { type: String },
  quota: { type: Number, default: 50 },
  class_code: { type: String },
  lecturer: { type: String }, 
  time: { type: String }, // e.g., "Mon 10:00-12:00"
  semester: { type: String, enum: ['Fall', 'Spring', 'Summer'] }
}, { 
  versionKey: false,
  collection: 'Lecture' 
});
const Lecture = models.Lecture || model('Lecture', LectureSchema);
export default Lecture;
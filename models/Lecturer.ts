import mongoose, { Schema, model, models } from 'mongoose';

const LecturerSchema = new Schema({
  _id: { type: String, required: true },
  personnel_id: { type: String, required: true },
  name_surname: { type: String, required: true },
  e_mail: { type: String, required: true },
  password: { type: String, default: "password123" },
  degree: { type: String },
  department: { type: String },
  is_head: { type: Boolean, default: false },
  lecture_catalog: { type: [String], default: [] }
}, { versionKey: false,
    collection: 'Lecturer'
 });

const Lecturer = models.Lecturer || model('Lecturer', LecturerSchema, 'Lecturer');

export default Lecturer;
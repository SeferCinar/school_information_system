import mongoose, { Schema, model, models } from 'mongoose';


const StudentSchema = new Schema({
  _id: { type: String, required: true }, 
  student_no: { type: String, required: true },
  name_surname: { type: String, required: true },
  date_of_birth: { type: Date },
  tc_no: { type: String },
  e_mail: { type: String, required: true },
  password: { type: String, default: "password123" },
  gpa: { type: Number, default: 0 },
  department: { type: String },
  lecture_catalog: { type: [String], default: [] }, 
  state: { type: String, default: "Active" }
}, { 
  versionKey: false 
});
const Student = models.Student || model('Student', StudentSchema, 'Student');
export default Student;
import mongoose, { Schema, model, models } from 'mongoose';

const Staff_Member_Schema = new Schema({
  _id: { type: String, required: true },
  personnel_id: { type: String, required: true },
  name_surname: { type: String, required: true },
  date_of_birth: { type: Date },
  tc_no: { type: String },
  degree: { type: String },
  faculty: { type: String },
  e_mail: { type: String, required: true },
  password: { type: String, default: "password123" }
}, { 
  versionKey: false,
  collection: 'StaffMember'});
  const StaffMember = models.StaffMember || model('StaffMember', Staff_Member_Schema);

export default StaffMember;
import mongoose, { Schema, model, models } from 'mongoose';

const EnrolmentSchema = new Schema({

  student_no: { 
    type: String, 
    required: true,
    ref: 'Student' 
  },
  lecture_code: { 
    type: String, 
    required: true,
    ref: 'Lecture' 
  },
  semester: { 
    type: String, 
    required: true 
  }
}, { 
  versionKey: false,
  collection: 'Enrolment'
});
EnrolmentSchema.index({ student_no: 1, lecture_code: 1, semester: 1 }, { unique: true });
const Enrolment = models.Enrolment || model('Enrolment', EnrolmentSchema);

export default Enrolment;
import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student","instructor","president","staff"],
    required: true
  },
  ref_id: { type: String, required: true } 
}, { versionKey: false, collection: "User" });

const User = models.User || model("User", UserSchema);
export default User;

import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  name: String, email: String, phone: String, passwordHash: String, role: { type: String, default: "user" }
});
export default mongoose.model("User", UserSchema);

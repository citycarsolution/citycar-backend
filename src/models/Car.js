import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  title: String,
  seats: String,
  image: String
});

export default mongoose.model("Car", carSchema);

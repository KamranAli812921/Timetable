import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    time: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { _id: true }
);

const DateEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    subjects: [SubjectSchema],
  },
  { _id: true }
);

const TimetableSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dateEntries: [DateEntrySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TimetableSchema.index({ userId: 1 });

export default mongoose.models.Timetable || mongoose.model("Timetable", TimetableSchema);

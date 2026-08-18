import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Timetable from "@/lib/models/Timetable";
import { getSessionFromRequest } from "@/lib/auth";
import { unauthorized, forbidden, notFound, badRequest } from "@/lib/apiHelpers";
import { parseDateKey, formatDateKey, formatFullDate } from "@/lib/dateUtils";
import { generateDayPdf } from "@/lib/pdf";

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();
  if (session.role !== "admin") return forbidden();

  const { userId, timetableId, date } = params;
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(timetableId)) return notFound();
  const parsedDate = parseDateKey(date);
  if (!parsedDate) return badRequest("Invalid date");

  await connectDB();
  const timetable = await Timetable.findById(timetableId);
  if (!timetable || timetable.userId.toString() !== userId) return notFound();

  const entry = timetable.dateEntries.find((e) => formatDateKey(e.date) === date);
  if (!entry || entry.subjects.length === 0) {
    return notFound("No subjects for this date");
  }

  const pdfBuffer = await generateDayPdf({
    timetableName: timetable.name,
    dateLabel: formatFullDate(parsedDate),
    subjects: entry.subjects,
  });

  const filename = `${sanitizeFilename(timetable.name)}-${date}.pdf`;

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

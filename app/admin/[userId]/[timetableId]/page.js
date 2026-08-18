import TimetableView from "@/components/TimetableView";

export default function AdminTimetablePage({ params }) {
  const { userId, timetableId } = params;
  return (
    <TimetableView
      fetchUrl={`/api/admin/timetables/${userId}/${timetableId}`}
      basePath={`/api/admin/timetables/${userId}/${timetableId}`}
      readOnly={true}
      backHref={`/admin/${userId}`}
      backLabel="Back to user's timetables"
      ownerLabel="Read-only (admin view)"
    />
  );
}

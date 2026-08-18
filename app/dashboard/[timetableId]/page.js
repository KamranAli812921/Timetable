import TimetableView from "@/components/TimetableView";

export default function TimetablePage({ params }) {
  const { timetableId } = params;
  return (
    <TimetableView
      fetchUrl={`/api/timetables/${timetableId}`}
      basePath={`/api/timetables/${timetableId}`}
      readOnly={false}
      backHref="/dashboard"
      backLabel="Back to my timetables"
    />
  );
}

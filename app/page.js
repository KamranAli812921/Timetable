import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
      <Image src="/logo.png" alt="Donkey's Timetable" width={80} height={80} className="rounded-xl" priority />
      <h1 className="text-4xl font-bold text-foreground">Donkey&apos;s Timetable</h1>
      <p className="text-muted-foreground max-w-md">
        Build named timetables laid out as a calendar. Click any date to add subjects,
        times, and notes — then export a single day as a PDF whenever you need it.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="px-5 py-2.5 border border-border text-foreground rounded-md font-medium bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}

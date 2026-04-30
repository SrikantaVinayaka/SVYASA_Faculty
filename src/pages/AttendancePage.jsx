import MenteeSmrTable from "../components/MenteeSmrTable";

export default function AttendancePage({
  students,
  onOpenStudent,
  onOpenMarks,
  onOpenQuickUpdate,
  onUpdateStudent,
}) {
  return (
    <MenteeSmrTable
      students={students}
      onOpenStudent={onOpenStudent}
      onOpenMarks={onOpenMarks}
      onOpenQuickUpdate={onOpenQuickUpdate}
      onUpdateStudent={onUpdateStudent}
      breadcrumbTitle="View SMR"
    />
  );
}

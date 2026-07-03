function MeetingPage({ student }) {
  if (!student) {
    return <div className="p-4 text-gray-500">Select a student</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">
        Meeting Details — {student.name}
      </h2>

      <h3 className="font-semibold mt-4">Meeting Information</h3>
      <p>Date: {student.meetingDate || "NA"}</p>
      <p>Topic: {student.meetingTopic || "NA"}</p>

      <h3 className="font-semibold mt-4">Meeting History</h3>
      {(student.meetingHistory || []).map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
}

export default MeetingPage;
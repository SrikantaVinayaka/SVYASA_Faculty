import { useMemo, useState } from "react";

function FieldRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right wrap-break-word">{value}</span>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="text-base font-semibold text-gray-900 mb-3">{title}</div>
      {children}
    </div>
  );
}

export default function StudentRecordPage({
  student,
  onBack,
  onUpdateStudent,
  smrMode = "view",
  onQuickUpdateClose,
}) {
  const [technicalSkill, setTechnicalSkill] = useState(
    student?.education?.technicalSkills ?? "NA"
  );
  const [showQuickModal, setShowQuickModal] = useState(smrMode === "quickUpdate");

  const [quickModalForm, setQuickModalForm] = useState(() => ({
    // Admission
    rank: student?.admission?.rank ?? "",
    department: student?.admission?.department ?? "",
    currentSemester: String(student?.admission?.currentSemester ?? ""),
    degreeProgram: student?.admission?.degreeProgram ?? "",
    hostelResident: student?.admission?.hostelResident ?? "",
    transportation: student?.admission?.transportation ?? "",
    admissionCategory: student?.admission?.admissionCategory ?? "",
    basicCategory: student?.admission?.basicCategory ?? "",
    specialCategory: student?.admission?.specialCategory ?? "",

    // Father / guardian
    fatherGuardianName: student?.parentGuardianName ?? "",
    fatherEmail: student?.fatherEmail ?? "",
    fatherMobile: student?.fatherMobile ?? "",

    // Mother
    motherName: student?.motherName ?? "",
    motherOccupation: student?.motherOccupation ?? "",
    motherEmail: student?.motherEmail ?? "",
    motherMobile: student?.motherMobile ?? "",
  }));

  const education = student?.education;

  const combinedPercent = useMemo(() => {
    if (!education) return 0;
    const a = Number(education.tenthPercentage);
    const b = Number(education.twelfthPercentage);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
    return Math.round((a + b) / 2);
  }, [education]);

  if (!student) return null;

  const photoSrc =
    student.photoUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`;

  const applyQuickModalUpdate = () => {
    if (!student) return;
    onUpdateStudent?.(student.usn, {
      admission: {
        ...student.admission,
        rank: quickModalForm.rank,
        department: quickModalForm.department,
        currentSemester: Number(quickModalForm.currentSemester) || student.admission.currentSemester,
        degreeProgram: quickModalForm.degreeProgram,
        hostelResident: quickModalForm.hostelResident,
        transportation: quickModalForm.transportation,
        admissionCategory: quickModalForm.admissionCategory,
        basicCategory: quickModalForm.basicCategory,
        specialCategory: quickModalForm.specialCategory,
      },
      parentGuardianName: quickModalForm.fatherGuardianName,
      fatherEmail: quickModalForm.fatherEmail,
      fatherMobile: quickModalForm.fatherMobile,
      motherName: quickModalForm.motherName,
      motherOccupation: quickModalForm.motherOccupation,
      motherEmail: quickModalForm.motherEmail,
      motherMobile: quickModalForm.motherMobile,
    });
    setShowQuickModal(false);
    onQuickUpdateClose?.();
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-1 text-sm my-4">
        <button
          type="button"
          className="text-red-800 font-medium hover:underline"
          onClick={onBack}
        >
          View SMR
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">Student mentoring record</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InfoCard title="Student &amp; photo">
          <div className="flex flex-col items-center text-center gap-3 mb-4">
            <img
              src={photoSrc}
              alt=""
              className="w-28 h-28 rounded-lg object-cover border border-gray-200 bg-gray-50"
            />
            <div>
              <div className="text-lg font-semibold text-gray-900">{student.name}</div>
              <div className="text-sm text-gray-500">
                {student.degree} • Sem {student.semester} • Sec {student.section}
              </div>
            </div>
          </div>
          <FieldRow label="USN" value={student.usn} />
          <FieldRow label="Date of birth" value={student.dob} />
          <FieldRow label="Date of joining" value={student.doj} />
          <FieldRow label="Email ID" value={student.emailId} />
          <FieldRow label="Mobile number" value={student.mobile} />
          <FieldRow label="Local address" value={student.localAddress} />
        </InfoCard>

        <InfoCard title="Admission details">
          <FieldRow label="Rank" value={student.admission.rank} />
          <FieldRow label="Department" value={student.admission.department} />
          <FieldRow label="Current semester" value={String(student.admission.currentSemester)} />
          <FieldRow label="Degree" value={student.admission.degreeProgram} />
          <FieldRow label="Hostel resident" value={student.admission.hostelResident} />
          <FieldRow label="Transportation" value={student.admission.transportation} />
          <FieldRow label="Admission category" value={student.admission.admissionCategory} />
          <FieldRow label="Special category" value={student.admission.specialCategory} />
          <FieldRow label="Basic category" value={student.admission.basicCategory} />
        </InfoCard>

        <InfoCard title="Parents &amp; guardian">
          <FieldRow label="Father / guardian name" value={student.parentGuardianName} />
          <FieldRow label="Father email ID" value={student.fatherEmail} />
          <FieldRow label="Father mobile number" value={student.fatherMobile} />
          <FieldRow label="Mother name" value={student.motherName} />
          <FieldRow label="Occupation" value={student.motherOccupation} />
          <FieldRow label="Mother email ID" value={student.motherEmail} />
          <FieldRow label="Mother mobile number" value={student.motherMobile} />
          <FieldRow label="Permanent address" value={student.permanentAddress} />
        </InfoCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <InfoCard title="Mentor information">
          <FieldRow label="Mentor name" value={student.mentorName} />
          <FieldRow label="Mentor contact" value={student.mentorContact} />
        </InfoCard>

        <InfoCard title="Meeting information">
          <FieldRow label="Name" value={student.name} />
          <FieldRow label="USN" value={student.usn} />
          <div className="flex justify-between gap-4 border-b border-gray-100 py-2 items-center">
            <span className="text-sm text-gray-500">SMR</span>
            <span className="text-sm font-semibold text-red-800">Open (this page)</span>
          </div>
        </InfoCard>
      </div>

      <div className="mt-4">
        <InfoCard title="Meeting history">
          <ul className="space-y-2 text-sm text-gray-700">
            {(student.meetingHistory ?? []).length === 0 ? (
              <li className="text-gray-400">No meeting history.</li>
            ) : (
              student.meetingHistory.map((m, i) => (
                <li
                  key={`${m.date}-${i}`}
                  className="border border-gray-100 rounded-md px-3 py-2 bg-gray-50"
                >
                  <span className="font-medium text-gray-800">{m.date}</span>
                  <span className="text-gray-600"> — {m.note}</span>
                </li>
              ))
            )}
          </ul>
        </InfoCard>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-sm font-semibold text-gray-900 mb-2">Education — current term</div>
          <p className="text-xs text-gray-500 mb-2">
            Current semester:{" "}
            <span className="font-medium text-gray-800">
              {education?.currentSemesterDisplay ?? student.semester}
            </span>
          </p>
          <p className="text-sm text-gray-700 mb-1">
            <span className="text-gray-500">Unit test scores:</span> {education?.unitTestScores}
          </p>
          <p className="text-sm text-gray-700 mb-1">
            <span className="text-gray-500">Attendance details:</span>{" "}
            {education?.attendanceSummary}
          </p>
          <p className="text-sm text-gray-700">
            <span className="text-gray-500">Enrolled subjects:</span> {education?.enrolledSubjects}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-sm font-semibold text-gray-900 mb-2">University exam results</div>
          <p className="text-sm text-gray-700">{education?.finalExamResults}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="text-sm font-semibold text-gray-900 mb-2">Backlog</div>
          <p className="text-sm text-gray-700">{education?.backlogs}</p>
        </div>
      </div>

      <div className="mt-4 bg-amber-50/80 rounded-lg border border-amber-100 p-5">
        <div className="text-base font-semibold text-gray-900 mb-2">
          Quick update (popup)
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Open the Update/Cancel dialog to edit Admission and Parent details.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-red-800 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-red-900"
            onClick={() => setShowQuickModal(true)}
          >
            Quick update
          </button>
        </div>
      </div>

      {(showQuickModal || smrMode === "quickUpdate") && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <div className="text-base font-semibold text-gray-900">
                  Quick Update
                </div>
                <div className="text-xs text-gray-500">
                  Edit admission, father/guardian, and mother details
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowQuickModal(false);
                  onQuickUpdateClose?.();
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close quick update"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 max-h-[75vh] overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-md p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">
                    Admission Details
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs text-gray-600">
                      Rank
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.rank}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            rank: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block text-xs text-gray-600">
                      Degree Program
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.degreeProgram}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            degreeProgram: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block text-xs text-gray-600">
                      Department
                      <select
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.department}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            department: e.target.value,
                          }))
                        }
                      >
                        <option value={quickModalForm.department}>
                          {quickModalForm.department}
                        </option>
                        <option value="MCA">MCA</option>
                        <option value="Computer Applications">
                          Computer Applications
                        </option>
                      </select>
                    </label>
                    <label className="block text-xs text-gray-600">
                      Current Semester
                      <input
                        type="number"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.currentSemester}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            currentSemester: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-md p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">
                    Categories / Residence
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs text-gray-600">
                      Hostel Resident
                      <select
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.hostelResident}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            hostelResident: e.target.value,
                          }))
                        }
                      >
                        <option value={quickModalForm.hostelResident}>
                          {quickModalForm.hostelResident}
                        </option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </label>
                    <label className="block text-xs text-gray-600">
                      Transportation
                      <select
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.transportation}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            transportation: e.target.value,
                          }))
                        }
                      >
                        <option value={quickModalForm.transportation}>
                          {quickModalForm.transportation}
                        </option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </label>
                    <label className="block text-xs text-gray-600">
                      Admission Category
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.admissionCategory}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            admissionCategory: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block text-xs text-gray-600">
                      Basic Category
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.basicCategory}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            basicCategory: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block text-xs text-gray-600">
                      Special Category
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.specialCategory}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            specialCategory: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border border-gray-100 rounded-md p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">
                    Father's / Guardian Details
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs text-gray-600">
                      Father's Name
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.fatherGuardianName}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            fatherGuardianName: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block text-xs text-gray-600">
                      Father's Email ID
                      <input
                        type="email"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.fatherEmail}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            fatherEmail: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block text-xs text-gray-600">
                      Father's Mobile Number
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.fatherMobile}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            fatherMobile: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-md p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">
                    Mother's Details
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs text-gray-600">
                      Mother's Name
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.motherName}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            motherName: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block text-xs text-gray-600">
                      Occupation
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.motherOccupation}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            motherOccupation: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block text-xs text-gray-600">
                      Mother's Email ID
                      <input
                        type="email"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.motherEmail}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            motherEmail: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block text-xs text-gray-600">
                      Mother's Mobile Number
                      <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                        value={quickModalForm.motherMobile}
                        onChange={(e) =>
                          setQuickModalForm((f) => ({
                            ...f,
                            motherMobile: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                onClick={() => {
                  setShowQuickModal(false);
                  onQuickUpdateClose?.();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-red-800 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-red-900"
                onClick={applyQuickModalUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="text-base font-semibold text-gray-900 mb-2">Prior schooling</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">10th percentage</div>
            <div className="text-sm font-medium">{education?.tenthPercentage}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">12th percentage</div>
            <div className="text-sm font-medium">{education?.twelfthPercentage}%</div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Combined (approx): <span className="font-medium text-gray-800">{combinedPercent}%</span>
        </div>
      </div>

      <details className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <summary className="cursor-pointer font-semibold text-gray-900">Technical skills</summary>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={technicalSkill}
            onChange={(e) => setTechnicalSkill(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-red-800 w-full md:w-72"
          >
            {(student.education?.technicalSkillOptions ?? ["NA"]).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-900"
            onClick={() =>
              onUpdateStudent?.(student.usn, {
                education: { ...student.education, technicalSkills: technicalSkill },
              })
            }
          >
            Update
          </button>
        </div>
      </details>
    </div>
  );
}

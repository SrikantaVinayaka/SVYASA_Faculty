import { useState } from "react";

const CERTIFICATE_CATEGORIES = ["Academic", "Non-Academic", "Curriculum", "Co-Curriculum"];

export default function CertificateUploadModal({ student, certificates = {}, onUpload, onClose }) {
  const [category, setCategory] = useState("Academic");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = () => {
    if (!file || !category) {
      alert("Please select category and file");
      return;
    }

    const newCertificate = {
      id: Date.now(),
      fileName: file.name,
      category: category,
      uploadedAt: new Date().toLocaleString(),
      size: `${(file.size / 1024).toFixed(2)} KB`,
    };

    onUpload(newCertificate);
    setFile(null);
    setFileName("");
    setCategory("Academic");
  };

  const certificatesByCategory = CERTIFICATE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = Object.values(certificates)
      .flat()
      .filter((cert) => cert.category === cat);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-lg border border-gray-300 bg-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Upload Certificate</h2>
            <p className="text-xs text-purple-100">{student.name} ({student.usn})</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Section */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Upload New Certificate</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CERTIFICATE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="cert-file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="cert-file"
                    className="flex-1 px-4 py-2 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition"
                  >
                    <div className="text-center">
                      <span className="text-2xl">📁</span>
                      <p className="text-xs text-gray-600 mt-1">Click to select file</p>
                      {fileName && <p className="text-xs text-purple-700 font-medium">{fileName}</p>}
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG</p>
              </div>

              <button
                onClick={handleUpload}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Upload Certificate
              </button>
            </div>
          </div>

          {/* Uploaded Certificates Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Uploaded Certificates</h3>
            {Object.values(certificatesByCategory).flat().length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">No certificates uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {CERTIFICATE_CATEGORIES.map((category) => {
                  const certs = certificatesByCategory[category];
                  if (certs.length === 0) return null;

                  return (
                    <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2">
                        <h4 className="font-medium text-gray-900 text-sm">{category}</h4>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {certs.map((cert) => (
                          <div key={cert.id} className="p-3 flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 break-words">{cert.fileName}</p>
                              <div className="flex gap-4 text-xs text-gray-600 mt-1">
                                <span>📅 {cert.uploadedAt}</span>
                                <span>💾 {cert.size}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded border border-blue-300"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded border border-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-300 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

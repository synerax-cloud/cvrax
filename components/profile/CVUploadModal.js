'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFileAlt, FaSpinner, FaCheckCircle, FaTimes } from 'react-icons/fa';

export default function CVUploadModal({ onClose, onParsed }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError('');
      }
    },
    onDropRejected: (rejectedFiles) => {
      setError('Invalid file. Please upload PDF, DOCX, DOC, or TXT (max 10MB)');
    },
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setParsing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const res = await fetch('/api/profile/parse-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log('CV upload response:', data);

      if (res.ok) {
        onParsed(data);
      } else {
        setError(data.error || 'Failed to parse CV');
      }
    } catch (err) {
      console.error('Error uploading CV:', err);
      setError('Failed to upload and parse CV');
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Import from CV</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <FaUpload className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop your CV here' : 'Drag & drop your CV here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
              <p className="text-xs text-gray-400">
                Supported formats: PDF, DOCX, DOC, TXT (max 10MB)
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <FaFileAlt className="text-3xl text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {parsing && (
                <div className="mt-4 flex items-center space-x-3 text-primary-600">
                  <FaSpinner className="animate-spin text-xl" />
                  <div>
                    <p className="font-medium">Parsing your CV...</p>
                    <p className="text-sm text-gray-600">
                      Extracting information from your document
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> We'll extract information from your CV and pre-fill your
              profile. You can review and edit all information before saving.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button onClick={onClose} className="btn btn-outline" disabled={uploading}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="btn btn-primary flex items-center space-x-2"
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaUpload />
                <span>Upload & Parse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

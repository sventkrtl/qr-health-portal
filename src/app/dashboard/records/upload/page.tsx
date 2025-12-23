'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Upload, File, X, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatFileSize } from '@/lib/utils';

const recordSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  recordType: z.enum(['lab_result', 'prescription', 'imaging', 'vaccination', 'visit_summary', 'insurance', 'other']),
  recordDate: z.string().min(1, 'Date is required'),
});

type RecordForm = z.infer<typeof recordSchema>;

const RECORD_TYPES = [
  { value: 'lab_result', label: '🧪 Lab Result' },
  { value: 'prescription', label: '💊 Prescription' },
  { value: 'imaging', label: '📷 Imaging/X-Ray' },
  { value: 'vaccination', label: '💉 Vaccination' },
  { value: 'visit_summary', label: '📝 Visit Summary' },
  { value: 'insurance', label: '💼 Insurance' },
  { value: 'other', label: '📁 Other' },
];

export default function UploadRecordPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordForm>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      recordDate: new Date().toISOString().split('T')[0],
      recordType: 'other',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  const onSubmit = async (data: RecordForm) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let mimeType = null;

      // Upload file if present
      if (file) {
        setUploadProgress(30);
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('health-records')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        setUploadProgress(60);

        const { data: { publicUrl } } = supabase.storage
          .from('health-records')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = file.name;
        fileSize = file.size;
        mimeType = file.type;
      }

      setUploadProgress(80);

      // Create health record
      const { error: insertError } = await supabase
        .from('health_records')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          record_type: data.recordType,
          record_date: data.recordDate,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          mime_type: mimeType,
        });

      if (insertError) throw insertError;

      setUploadProgress(100);
      setSuccess(true);

      // Send email notification
      await fetch('/api/notifications/record-uploaded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordName: data.title }),
      });

      setTimeout(() => {
        router.push('/dashboard/records');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload record');
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Uploaded!</h2>
          <p className="text-gray-600">Your health record has been securely saved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Health Record</h1>
          <p className="text-gray-600 mb-8">Add a new health document to your secure vault.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : file
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-4">
                  <File className="w-10 h-10 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
                  </p>
                  <p className="text-sm text-gray-400">PDF, images, Word documents (max 50MB)</p>
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Blood Test Results - January 2025"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Record Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Record Type *</label>
              <select
                {...register('recordType')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {RECORD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Record Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Record Date *</label>
              <input
                {...register('recordDate')}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.recordDate && <p className="mt-1 text-sm text-red-600">{errors.recordDate.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add any notes about this record..."
              />
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Record
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
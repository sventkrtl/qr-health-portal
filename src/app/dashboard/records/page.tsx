import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Upload, Filter, Search, ArrowLeft, Calendar, Download, Trash2 } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';

export default async function RecordsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: records } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', user.id)
    .order('record_date', { ascending: false });

  const recordTypeLabels: Record<string, string> = {
    lab_result: '🧪 Lab Result',
    prescription: '💊 Prescription',
    imaging: '📷 Imaging',
    vaccination: '💉 Vaccination',
    visit_summary: '📝 Visit Summary',
    insurance: '💼 Insurance',
    other: '📁 Other',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
            <p className="text-gray-600">{records?.length || 0} records in your vault</p>
          </div>
          <Link
            href="/dashboard/records/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            <Upload className="w-4 h-4" />
            Upload Record
          </Link>
        </div>

        {/* Records Grid */}
        {records && records.length > 0 ? (
          <div className="grid gap-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{record.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                          {recordTypeLabels[record.record_type] || record.record_type}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(record.record_date)}
                        </span>
                        {record.file_size && (
                          <span>{formatFileSize(record.file_size)}</span>
                        )}
                      </div>
                      {record.description && (
                        <p className="mt-2 text-sm text-gray-600">{record.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.file_url && (
                      <a
                        href={record.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No records yet</h3>
            <p className="text-gray-600 mb-6">Start building your health vault by uploading your first record.</p>
            <Link
              href="/dashboard/records/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
            >
              <Upload className="w-5 h-5" />
              Upload Your First Record
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
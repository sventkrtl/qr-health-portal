import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, MessageSquare, Upload, User, LogOut, TrendingUp, Calendar, Activity } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user stats
  const { count: recordsCount } = await supabase
    .from('health_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: chatsCount } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: recentRecords } = await supabase
    .from('health_records')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <span className="text-xl font-bold text-gray-900">QR Health Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {profile?.full_name || user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-primary-100">
            Your health dashboard is ready. Upload records, chat with AI, or review your health history.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Health Records"
            value={recordsCount || 0}
            color="blue"
          />
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            label="AI Chats"
            value={chatsCount || 0}
            color="purple"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="This Month"
            value={recentRecords?.filter(r => 
              new Date(r.created_at).getMonth() === new Date().getMonth()
            ).length || 0}
            color="green"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Health Score"
            value="Good"
            color="emerald"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickAction
            href="/dashboard/records/upload"
            icon={<Upload className="w-8 h-8" />}
            title="Upload Record"
            description="Add new health documents"
            color="primary"
          />
          <QuickAction
            href="/dashboard/chat"
            icon={<MessageSquare className="w-8 h-8" />}
            title="AI Health Chat"
            description="Ask questions about your health"
            color="purple"
          />
          <QuickAction
            href="/dashboard/profile"
            icon={<User className="w-8 h-8" />}
            title="My Profile"
            description="Update your information"
            color="blue"
          />
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Health Records</h2>
            <Link
              href="/dashboard/records"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentRecords && recentRecords.length > 0 ? (
              recentRecords.map((record) => (
                <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.title}</p>
                        <p className="text-sm text-gray-500">
                          {record.record_type.replace('_', ' ')} • {new Date(record.record_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/records/${record.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No health records yet</p>
                <Link
                  href="/dashboard/records/upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
                >
                  <Upload className="w-4 h-4" />
                  Upload Your First Record
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-600 hover:bg-primary-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <Link
      href={href}
      className={`${colorClasses[color]} rounded-xl p-6 text-white transition group`}
    >
      <div className="mb-4 opacity-90 group-hover:opacity-100 transition">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
}
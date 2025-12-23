import Link from 'next/link';
import { ArrowRight, Shield, Brain, FileText, Bell } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏥</span>
            <span className="text-xl font-bold">QR Health Portal</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Your Health, <span className="text-primary-200">Intelligently</span> Managed
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto">
            Securely upload, organize, and understand your health records with AI-powered insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold text-lg hover:bg-primary-50 transition shadow-lg"
            >
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/10 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Comprehensive health management powered by cutting-edge AI technology.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure Storage"
              description="Bank-level encryption protects your sensitive health data at rest and in transit."
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Health Assistant"
              description="Chat with our AI to understand your health records and get wellness insights."
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Easy Uploads"
              description="Drag and drop any health document - PDFs, images, lab results, and more."
            />
            <FeatureCard
              icon={<Bell className="w-8 h-8" />}
              title="Smart Notifications"
              description="Get reminders for appointments, medication refills, and health checkups."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust QR Health Portal for their health management needs.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition shadow-lg"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-2xl">🏥</span>
              <span className="text-lg font-semibold text-white">QR Health Portal</span>
            </div>
            <p className="text-sm">
              © 2025 Quantum Rishi (SV Enterprises). All rights reserved.
            </p>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            <a href="https://health.quantum-rishi.com" className="hover:text-primary-400">
              health.quantum-rishi.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition group">
      <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const from = process.env.EMAIL_FROM || 'health@quantum-rishi.com';

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

// Email Templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to QR Health Portal',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; background: #f0fdf4; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 700; color: #16a34a; }
            h1 { color: #166534; margin-bottom: 20px; }
            p { color: #4b5563; line-height: 1.6; }
            .button { display: inline-block; background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏥 QR Health Portal</div>
            </div>
            <h1>Welcome, ${name}!</h1>
            <p>Thank you for joining QR Health Portal. Your secure health management journey begins now.</p>
            <p>With our platform, you can:</p>
            <ul>
              <li>Securely upload and manage health records</li>
              <li>Chat with our AI health assistant</li>
              <li>Track your health history over time</li>
              <li>Get personalized health insights</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
            <div class="footer">
              <p>© 2025 Quantum Rishi (SV Enterprises)</p>
              <p>health.quantum-rishi.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  recordUploaded: (recordName: string) => ({
    subject: 'Health Record Uploaded Successfully',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; background: #f0fdf4; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 700; color: #16a34a; }
            .success { background: #dcfce7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .success-icon { font-size: 48px; }
            h1 { color: #166534; margin-bottom: 20px; }
            p { color: #4b5563; line-height: 1.6; }
            .button { display: inline-block; background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏥 QR Health Portal</div>
            </div>
            <div class="success">
              <div class="success-icon">✅</div>
              <h2>Record Uploaded!</h2>
            </div>
            <p>Your health record <strong>"${recordName}"</strong> has been securely uploaded to your account.</p>
            <p>You can now:</p>
            <ul>
              <li>View the record in your dashboard</li>
              <li>Ask our AI assistant questions about it</li>
              <li>Share it securely with healthcare providers</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/records" class="button">View Records</a>
            <div class="footer">
              <p>© 2025 Quantum Rishi (SV Enterprises)</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};
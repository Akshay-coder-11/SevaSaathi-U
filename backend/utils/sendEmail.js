import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter && process.env.EMAIL_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_PORT === '465',
      pool: true, // Enable SMTP connection pooling
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10, // Max 10 messages per second
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

const sendEmail = async (options) => {
  const isDev = !process.env.EMAIL_HOST;

  if (isDev) {
    console.log('[Nodemailer Mock] Simulation Email Sent:');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    return { mock: true, message: "Email simulated successfully in developer mode" };
  }

  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    throw new Error('Email transporter is not configured correctly.');
  }

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'SevaSaathi Support'}" <${process.env.FROM_EMAIL || 'noreply@sevasaathi.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`
  };

  const info = await activeTransporter.sendMail(mailOptions);
  console.log(`Message sent: ${info.messageId}`);
  return info;
};

export default sendEmail;

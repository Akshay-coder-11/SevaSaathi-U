import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const isDev = process.env.NODE_ENV !== 'production' || !process.env.EMAIL_HOST;

  if (isDev) {
    console.log('[Nodemailer Mock] Simulation Email Sent:');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    return { mock: true, message: "Email simulated successfully in developer mode" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'SevaSaathi Support'}" <${process.env.FROM_EMAIL || 'noreply@sevasaathi.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Message sent: ${info.messageId}`);
  return info;
};

export default sendEmail;

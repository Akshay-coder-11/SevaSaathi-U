import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const isDev = !process.env.EMAIL_HOST;

  if (isDev) {
    console.log('[Nodemailer Mock] Simulation Email Sent:');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    return { mock: true, message: "Email simulated successfully in developer mode" };
  }

  try {
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    const host = process.env.EMAIL_HOST || '';
    
    let transporterConfig = {};

    // If using Gmail and port is specifically 587, use standard SMTP with port 587
    if (host.toLowerCase().includes('gmail') && port === 587) {
      transporterConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // TLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    } else if (host.toLowerCase().includes('gmail')) {
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    } else {
      transporterConfig = {
        host: host,
        port: port,
        secure: port === 465, // True for 465, false for 587/other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          // Do not fail on self-signed or invalid certificates (highly recommended for custom SMTP/cPanel/Hostinger/shared mail hosting on Render)
          rejectUnauthorized: false
        }
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'SevaSaathi Support'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreply@sevasaathi.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent successfully to ${options.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error occurred while sending email to ${options.email}:`, error);
    throw error;
  }
};

export default sendEmail;

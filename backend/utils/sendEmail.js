import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.js';

const sendEmail = async (options) => {
  // We mock only if credentials are not configured.
  // If EMAIL_USER and EMAIL_PASS are set, we MUST send a real email.
  const isDev = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;

  if (isDev) {
    console.log('[Nodemailer Mock] Simulation Email Sent:');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    
    try {
      await EmailLog.create({
        recipient: options.email.toLowerCase().trim(),
        subject: options.subject,
        status: 'simulated',
        smtpResponse: options.message || 'Simulated locally (missing SMTP credentials)',
        timestamp: new Date()
      });
    } catch (logErr) {
      console.warn('Failed to save simulated email log:', logErr.message);
    }

    return { mock: true, message: "Email simulated successfully in developer mode" };
  }

  let logId = null;
  try {
    const logObj = await EmailLog.create({
      recipient: options.email.toLowerCase().trim(),
      subject: options.subject,
      status: 'pending',
      timestamp: new Date()
    });
    logId = logObj._id;
  } catch (logErr) {
    console.warn('Failed to save pending email log:', logErr.message);
  }

  try {
    const port = parseInt(process.env.EMAIL_PORT || '465', 10);
    let host = process.env.EMAIL_HOST || '';
    
    // Auto-detect host if missing but credentials are provided
    if (!host && process.env.EMAIL_USER) {
      if (process.env.EMAIL_USER.toLowerCase().includes('gmail')) {
        host = 'smtp.gmail.com';
      } else {
        // Safe default fallback for custom SMTP domain
        host = 'smtp.' + process.env.EMAIL_USER.split('@')[1];
      }
    }

    let transporterConfig = {
      pool: true, // Enable SMTP connection pooling for blazing fast delivery!
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 5000, // Fail fast in 5s if port is blocked on Render
      greetingTimeout: 5000,   // Fail fast in 5s if greeting is slow
      socketTimeout: 10000     // 10s socket timeout
    };

    const isGmailService = host.toLowerCase().includes('gmail') || (process.env.EMAIL_USER && process.env.EMAIL_USER.toLowerCase().includes('gmail'));

    // If using Gmail, use built-in 'gmail' service config by default as it is much more reliable than custom port 587 on cloud networks
    if (isGmailService) {
      transporterConfig = {
        ...transporterConfig,
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    } else {
      transporterConfig = {
        ...transporterConfig,
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

    if (logId) {
      try {
        await EmailLog.findByIdAndUpdate(logId, {
          smtpConfig: {
            host: host,
            port: port,
            service: isGmailService ? 'gmail' : undefined
          }
        });
      } catch (logErr) {
        console.warn('Failed to update email log config:', logErr.message);
      }
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const isGmail = host.toLowerCase().includes('gmail') || (process.env.EMAIL_USER && process.env.EMAIL_USER.toLowerCase().includes('gmail'));
    const senderEmail = isGmail ? process.env.EMAIL_USER : (process.env.FROM_EMAIL || process.env.EMAIL_USER);

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'SevaSaathi Support'}" <${senderEmail}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent successfully to ${options.email}: ${info.messageId}`);

    if (logId) {
      try {
        await EmailLog.findByIdAndUpdate(logId, {
          status: 'delivered',
          smtpResponse: info.response || `MessageId: ${info.messageId}`
        });
      } catch (logErr) {
        console.warn('Failed to update delivered email log:', logErr.message);
      }
    }

    return info;
  } catch (error) {
    console.error(`Error occurred while sending email to ${options.email}:`, error);
    
    if (logId) {
      try {
        await EmailLog.findByIdAndUpdate(logId, {
          status: 'failed',
          smtpResponse: options.message,
          errorMessage: error.message || String(error)
        });
      } catch (logErr) {
        console.warn('Failed to update failed email log:', logErr.message);
      }
    }

    // Provide a super-friendly guidance error if it fails on Gmail authentication
    if (error.message && (error.message.includes('Username and Password not accepted') || error.message.includes('AuthenticationRequired'))) {
      throw new Error(`SMTP login failed. If using Gmail, please make sure you configured a 16-digit Google "App Password" (NOT your normal password) in your environment settings under EMAIL_PASS.`);
    }
    
    throw error;
  }
};

export default sendEmail;

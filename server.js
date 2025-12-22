require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Create transporter for nodemailer using SMTP settings from env
function createTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

app.post('/api/send-message', async (req, res) => {
  try {
    const { message, contactMethod, contactValue } = req.body || {};

    // Send email to architect
    const transporter = createTransporter();
    const toEmail = process.env.ARCHITECT_EMAIL || 'sorlyjesai@gmail.com';

    if (transporter) {
      const html = `<p><strong>Message from TechBuild Group site:</strong></p><p>${message || ''}</p><p><strong>Contact method:</strong> ${contactMethod || 'not provided'}</p><p><strong>Contact value:</strong> ${contactValue || 'not provided'}</p>`;
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: toEmail,
        subject: 'New message from TechBuild Group site',
        html,
      });
    }

    // If WhatsApp contact provided and Twilio configured, send a WhatsApp message
    if (contactMethod === 'whatsapp' && contactValue && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
      const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      try {
        await client.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
          to: `whatsapp:${contactValue}`,
          body: `Thanks for contacting TechBuild Group. We received your request: ${message || ''}`,
        });
      } catch (err) {
        console.warn('Twilio message failed', err && err.message);
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`TechBuild Group backend listening on http://localhost:${PORT}`);
});

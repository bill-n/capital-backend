// backend/server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN).split(',');

// Middleware
// app.use(cors());
app.use(express.json());
// const cors = require('cors');

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));


// Set up multer for file uploads
const upload = multer();

// POST endpoint to receive form data + pdf
app.post('/send-email', upload.single('pdf'), async (req, res) => {
  const { reporterName, facilityName } = req.body;
  const pdfBuffer = req.file.buffer;

  try {
    const transporter = nodemailer.createTransport({
      service: 'SendGrid', // or 'Gmail', 'Outlook' etc.
      auth: {
        user: process.env.EMAIL_USER, // SendGrid or SMTP username
        pass: process.env.EMAIL_PASS, // SendGrid or SMTP password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `Report from ${reporterName} - ${facilityName}`,
      text: `Attached is the report from ${reporterName} at ${facilityName}.`,
      attachments: [
        {
          filename: 'report.pdf',
          content: pdfBuffer,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email..try again' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

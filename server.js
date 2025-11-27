const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sorlyjesai@gmail.com',
      pass: 'rgzp guha szuv zexy', // Gmail App Password
    },
  });

  let mailOptions = {
    from: email,
    to: 'sorlyjesai@gmail.com',
    subject: subject||`New message from ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error });
  }
});

app.listen(4000, () => console.log('Server running on port 4000'));

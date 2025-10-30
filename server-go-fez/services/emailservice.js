require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // Ou un autre service (Mailtrap, SendGrid, etc.)
    host: "smtp.gmail.com",
    port: 465, 
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,  // Ton email
        pass: process.env.EMAIL_PASS,  // Ton mot de passe ou App Password
    },
    tls: {
        rejectUnauthorized: false, // Pour ignorer les erreurs de certificat (non recommandé en production)
    },
});

module.exports = transporter;
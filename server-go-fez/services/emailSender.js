const transporter = require('./emailservice');
const bcrypt = require('bcryptjs');

/**
 * Génère un code OTP à 6 chiffres
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash le code OTP avant de le sauvegarder
 */
const hashOTP = async (otp) => {
  const saltRounds = 10;
  return await bcrypt.hash(otp, saltRounds);
};

/**
 * Vérifie si le code OTP correspond au hash
 */
const verifyOTPCode = async (otp, hashedOtp) => {
  return await bcrypt.compare(otp, hashedOtp);
};

/**
 * Envoie un email de vérification avec le code OTP
 */
const sendVerificationEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Vérification de votre email - GO-FEZ',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #6366f1;
              margin-bottom: 30px;
            }
            .otp-code {
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              color: #6366f1;
              background-color: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue sur GO-FEZ !</h1>
            </div>
            <p>Bonjour,</p>
            <p>Merci d'avoir créé votre compte. Pour vérifier votre adresse email, veuillez utiliser le code suivant :</p>
            
            <div class="otp-code">${otp}</div>
            
            <p>Ce code est valide pendant <strong>10 minutes</strong>.</p>
            <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
            
            <div class="footer">
              <p>Cordialement,<br>L'équipe GO-FEZ</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email de vérification envoyé à:', email);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP: verifyOTPCode,
  sendVerificationEmail
};


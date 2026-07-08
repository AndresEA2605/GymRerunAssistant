import nodemailer from 'nodemailer';

// Create a reusable transporter using default SMTP transport or Ethereal for testing
// In production on Vercel, use environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'password123',
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const isDev = process.env.NODE_ENV !== 'production' || !process.env.SMTP_HOST;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"PokeAssistant" <noreply@pokeassistant.com>',
    to: email,
    subject: 'Recuperación de contraseña - PokeAssistant',
    text: `Has solicitado recuperar tu contraseña en PokeAssistant.\n\nTu token de recuperación es:\n\n${token}\n\nIngresa este código en la aplicación para crear una nueva contraseña. Si no solicitaste este cambio, puedes ignorar este correo.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #07090e; color: #e5e7eb; padding: 20px; border-radius: 12px; border: 1px solid #1f2937;">
        <h2 style="color: #38bdf8; text-align: center;">Recuperación de contraseña</h2>
        <p>Has solicitado recuperar tu contraseña en PokeAssistant.</p>
        <p>Tu token de recuperación es:</p>
        <div style="background: #111827; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 2px; color: #38bdf8; border: 1px solid #1f2937;">
          ${token}
        </div>
        <p style="margin-top: 20px; color: #9ca3af; font-size: 14px;">Ingresa este código en la aplicación para crear una nueva contraseña. Si no solicitaste este cambio, puedes ignorar este correo.</p>
      </div>
    `,
  };

  try {
    if (isDev) {
      // In development or when no SMTP is configured, we just log the token so the dev can use it
      console.log('\n=============================================');
      console.log('EMAIL INTERCEPTED (DEV MODE)');
      console.log(`TO: ${email}`);
      console.log(`TOKEN: ${token}`);
      console.log('=============================================\n');
    }
    
    // Attempt to send email. If it's the fake ethereal credentials, it will fail unless they match a real account, 
    // but we wrap in try-catch so it doesn't break the flow.
    if (process.env.SMTP_HOST) {
      await transporter.sendMail(mailOptions);
    }
    return { ok: true };
  } catch (error) {
    console.error('Error sending email:', error);
    // We return ok: true even if it fails so we don't leak whether the email exists, 
    // but in a real app we might handle it differently.
    return { ok: true };
  }
}

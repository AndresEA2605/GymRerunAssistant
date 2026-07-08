import nodemailer from 'nodemailer';

function getTransporterConfig() {
  const host = process.env.SMTP_HOST || process.env.GMAIL_HOST || '';
  const port = Number(process.env.SMTP_PORT || process.env.GMAIL_PORT || 587);
  const secure = (process.env.SMTP_SECURE || process.env.GMAIL_SECURE || 'false').toLowerCase() === 'true';
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS || '';

  if (user && pass) {
    if (host) {
      return {
        host,
        port,
        secure,
        auth: { user, pass },
      };
    }

    return {
      service: 'gmail',
      auth: { user, pass },
    };
  }

  return null;
}

const transporterConfig = getTransporterConfig();
const transporter = transporterConfig ? nodemailer.createTransport(transporterConfig) : null;

export async function sendPasswordResetEmail(email: string, token: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.GMAIL_FROM || '"PokeAssistant" <noreply@pokeassistant.com>',
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
    if (!transporter) {
      console.log('\n=============================================');
      console.log('EMAIL INTERCEPTED (SMTP not configured)');
      console.log(`TO: ${email}`);
      console.log(`TOKEN: ${token}`);
      console.log('=============================================\n');
      return { ok: false, error: 'No hay configuración SMTP activa para enviar el correo. Configura SMTP_USER y SMTP_PASS (o GMAIL_USER/GMAIL_PASS).' };
    }

    await transporter.verify();
    await transporter.sendMail(mailOptions);
    return { ok: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { ok: false, error: 'No se pudo enviar el correo de recuperación. Revisa la configuración SMTP.' };
  }
}

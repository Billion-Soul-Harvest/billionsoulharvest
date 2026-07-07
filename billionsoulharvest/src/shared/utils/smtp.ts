import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export function getSmtpTransport() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export function getFromAddress() {
  return (
    process.env.SMTP_FROM ||
    "Billion Soul Harvest <info@billionsoulharvest.org>"
  );
}

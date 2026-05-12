import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { ADMIN_ID } from "../constants.js";

if (!process.env.MAILERSEND_API_KEY) {
  throw new Error("MAILERSEND_API_KEY is not set in environment variable");
}

if (!process.env.MAILERSEND_SENDER_EMAIL) {
  throw new Error("MAILERSEND_SENDER_EMAIL is not set in environment variable");
}

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY as string,
});

export const sendMail = async ({
  toEmail,
  toName,
  subject,
  html,
}: {
  toEmail: string;
  toName: string;
  subject: string;
  html: string;
}) => {
  const sentFrom = new Sender(
    process.env.MAILERSEND_SENDER_EMAIL as string,
    "Vivato",
  );

  const recipients = [new Recipient(toEmail, toName)];

  const ccRecipients = [new Recipient(ADMIN_ID, "Admin-vivato")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(subject)
    .setHtml(html)
    .setCc(ccRecipients);

  await mailerSend.email.send(emailParams);
};

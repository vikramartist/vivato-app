import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set properly");
}
const resendClient = new Resend(process.env.RESEND_API_KEY as string);

type Email = {
  from: string;
  to: string[];
  bcc?: string[];
  cc?: string[];
  subject: string;
  template: string;
};

export const sendEmail = async ({
  from,
  subject,
  template,
  to,
  bcc,
  cc,
}: Email) => {
  try {
    const response = await resendClient.emails.send({
      from: from!,
      to: to!,
      bcc: bcc!,
      subject: subject,
      html: template,
      cc: cc!,
    });

    return response;
  } catch (error) {
    console.error(error);
    throw new Error("Error while sending the request");
  }
};

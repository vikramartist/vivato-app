import { Inngest, type InngestFunction } from "inngest";
import { CALLBACK_URL } from "../constants.js";
import { newRoleRequest } from "../services/template.js";
import { approveOrDeclineRoleRequest } from "../services/approveOrDeclinetemplate.js";
import { paymentSuccessTemplate } from "../services/paymenttemplate.js";
import { sendMail } from "../services/mailersend.js";

export const inngest = new Inngest({
  id: "vivato",
  eventKey: process.env.INNGEST_EVENT_KEY as string,
});

const roleRequestMail = inngest.createFunction(
  { id: "role-request-mail", triggers: [{ event: "role/requested" }] },
  async ({ event }) => {
    try {
      const { email, name, currentRole, requestedRole } = event.data;

      await sendMail({
        toEmail: email,
        toName: name,
        subject: `Request for Role Change | ${currentRole} - ${requestedRole}`,
        html: newRoleRequest({
          name: name,
          currentRole: currentRole,
          callbackUrl: CALLBACK_URL,
        }),
      });
    } catch (error) {
      console.error("Mail failed:", error);
    }
  },
);

const approvalMail = inngest.createFunction(
  { id: "role-approve-mail", triggers: [{ event: "role/approve" }] },
  async ({ event }) => {
    try {
      const { email, requestedRole, name, status, comments } = event.data;
      await sendMail({
        toEmail: email,
        toName: name,
        subject: `Approval for Role Change Request | ${requestedRole}`,
        html: approveOrDeclineRoleRequest({
          name: name,
          currentRole: requestedRole,
          requestStatus: status,
          comments: comments,
          callbackUrl: CALLBACK_URL,
        }),
      });
    } catch (error) {
      console.error("Mail failed:", error);
    }
  },
);

const declineMail = inngest.createFunction(
  { id: "role-decline-mail", triggers: [{ event: "role/decline" }] },
  async ({ event }) => {
    try {
      const { email, requestedRole, name, status, comments } = event.data;
      await sendMail({
        toEmail: email,
        toName: name,
        subject: `Rejection for Role Change Request | ${requestedRole}`,
        html: approveOrDeclineRoleRequest({
          name: name,
          currentRole: requestedRole,
          requestStatus: status,
          comments: comments,
          callbackUrl: CALLBACK_URL,
        }),
      });
    } catch (error) {
      console.error("Mail failed:", error);
    }
  },
);

const paymentSuccessMail = inngest.createFunction(
  { id: "payment-success-mail", triggers: [{ event: "payment/success" }] },
  async ({ event }) => {
    try {
      const {
        deliveryDetails,
        id,
        status,
        createdAt,
        restaurantName,
        totalAmount,
      } = event.data;
      await sendMail({
        toEmail: deliveryDetails?.email as string,
        toName: deliveryDetails?.name as string,
        subject: `Order Received - Vivato`,
        html: paymentSuccessTemplate({
          customerName: deliveryDetails?.name as string,
          email: deliveryDetails?.email as string,
          contact: deliveryDetails?.contact as string,
          address: (deliveryDetails?.addressLine1 +
            deliveryDetails?.city +
            deliveryDetails?.country) as string,
          orderDetails: {
            restaurantName: restaurantName as string,
            amountPaid: totalAmount as number,
            orderId: id.toString(),
            status: status as string,
            createdAt: createdAt,
          },
          callbackUrl: CALLBACK_URL,
        }),
      });
    } catch (error) {
      console.error("Mail failed:", error);
    }
  },
);

export const functions: InngestFunction.Any[] = [
  roleRequestMail,
  approvalMail,
  declineMail,
  paymentSuccessMail,
];

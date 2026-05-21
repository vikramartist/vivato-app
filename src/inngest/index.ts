import { Inngest, type InngestFunction } from "inngest";
import { ADMIN_ID, CALLBACK_URL, CC, RESEND_ADMIN } from "../constants.js";
import { newRoleRequest } from "../services/template.js";
import { approveOrDeclineRoleRequest } from "../services/approveOrDeclinetemplate.js";
import { paymentSuccessTemplate } from "../services/paymenttemplate.js";
import { resend } from "../services/resend.js";
import { orderSuccessTemplate } from "../services/orderSuccessTemplate.js";
import { formatDate } from "../utils/date-format.js";

export const inngest = new Inngest({
  id: "vivato",
  eventKey: process.env.INNGEST_EVENT_KEY as string,
});

const roleRequestMail = inngest.createFunction(
  { id: "role-request-mail", triggers: [{ event: "role/requested" }] },
  async ({ event }) => {
    try {
      const { email, name, currentRole, requestedRole } = event.data;

      const { data, error } = await resend.emails.send({
        from: RESEND_ADMIN,
        to: email,
        subject: `Request for Role Change | ${currentRole} - ${requestedRole}`,
        html: newRoleRequest({
          name: name,
          currentRole: currentRole,
          callbackUrl: CALLBACK_URL,
        }),
        cc: [ADMIN_ID, CC],
      });

      if (error) {
        console.log(error);
        throw new Error("Failed to send email");
      }

      console.log("Mail sent successfully!", data.id);
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

      const { data, error } = await resend.emails.send({
        from: RESEND_ADMIN,
        to: email,
        subject: `Approval for Role Change Request | ${requestedRole}`,
        html: approveOrDeclineRoleRequest({
          name: name,
          currentRole: requestedRole,
          requestStatus: status,
          comments: comments,
          callbackUrl: CALLBACK_URL,
        }),
        cc: [ADMIN_ID, CC],
      });

      if (error) {
        console.log(error);
        throw new Error("Failed to send email");
      }

      console.log("Mail sent successfully!", data.id);
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

      const { data, error } = await resend.emails.send({
        from: RESEND_ADMIN,
        to: email,
        subject: `Rejection for Role Change Request | ${requestedRole}`,
        html: approveOrDeclineRoleRequest({
          name: name,
          currentRole: requestedRole,
          requestStatus: status,
          comments: comments,
          callbackUrl: CALLBACK_URL,
        }),
        cc: [ADMIN_ID, CC],
      });

      if (error) {
        console.log(error);
        throw new Error("Failed to send email");
      }

      console.log("Mail sent successfully!", data.id);
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

      const { data, error } = await resend.emails.send({
        from: RESEND_ADMIN,
        to: deliveryDetails?.email as string,
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
        cc: [ADMIN_ID, CC],
      });

      if (error) {
        console.log(error);
        throw new Error("Failed to send email");
      }

      console.log("Mail sent successfully!", data.id);
    } catch (error) {
      console.error("Mail failed:", error);
    }
  },
);

const deliverySuccessfullMail = inngest.createFunction(
  { id: "delivery-success", triggers: [{ event: "delivery/success" }] },
  async ({ event }) => {
    try {
      const {
        deliveryDetails,
        id,
        status,
        createdAt,
        restaurantName,
        totalAmount,
        riderDetails,
      } = event.data;

      const { data, error } = await resend.emails.send({
        from: RESEND_ADMIN,
        to: deliveryDetails?.email as string,
        cc: [CC, riderDetails?.email as string, ADMIN_ID],
        subject: "Order Delivered - Vivato",
        html: orderSuccessTemplate({
          callbackUrl: CALLBACK_URL,
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
            createdAt: formatDate(new Date(createdAt as Date)),
          },
          riderDetails: {
            name: riderDetails?.name as string,
            email: riderDetails?.email as string,
            contact: riderDetails?.contact as string,
            riderId: riderDetails?.riderId as string,
            vehicleType: riderDetails?.vehicleType as string,
            vehicleNumber: riderDetails?.vehicleNumber as string,
            deliveredAt: formatDate(
              new Date(riderDetails?.deliveredAt as Date),
            ),
          },
        }),
      });

      if (error) {
        console.log(error);
        throw new Error("Failed to send email");
      }

      console.log("Mail sent successfully!", data.id);
    } catch (error) {
      console.log("Delivery Mail failed:", error);
    }
  },
);

export const functions: InngestFunction.Any[] = [
  roleRequestMail,
  approvalMail,
  declineMail,
  paymentSuccessMail,
  deliverySuccessfullMail,
];

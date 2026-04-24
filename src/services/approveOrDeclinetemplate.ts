export const approveOrDeclineRoleRequest = ({
  name,
  currentRole,
  requestStatus,
  comments,
}: {
  name: string;
  currentRole: string;
  requestStatus: string;
  comments: string;
}) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ff7a18, #ffb347); padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">Welcome to Vivato 🎉</h1>
      </div>

      <!-- Body -->
      <div style="padding: 25px;">
        <h2 style="color: #333;">Hey ${name || "there"}, 👋</h2>
        
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          We&apos;ve ${requestStatus === "approved" ? "approved " : "rejected "} your request for Role Change
          <strong>${currentRole || "Customer"}</strong>
        </p>

        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          ${requestStatus === "approved" ? "Our team has approved your role change request application. Now you are able to Create your Restaurants and manage them 🚀" : "Our Team has rejected your role change request application. Go through the comments below to understand why it got rejected. Thanks for your co-pperation. You'll be able to create a new role request in some time"} 
        </p>

        <!-- Status Box -->
        <div style="margin: 20px 0; padding: 15px; background-color: #fff4e6; border-left: 5px solid #ff7a18; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: #333;">
            <strong>Status:</strong> ${requestStatus === "approved" ? "Approved" : "Rejected"} ⏳
          </p>
        </div>

        <p style="color: #555; font-size: 14px;">
          Comments: Refer bewlo for your comments on the Request

          <p style="margin: 0; font-size: 14px; color: #333;">
          ${requestStatus === "approved" ? `\n\nApproval Comment\n\n\n${comments}\n\n` : `\n\nReason for Rejection\n\n\n${comments}\n\n`}
          </p>
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 25px 0;">
          <a href="http://localhost:5173"
            style="background: #ff7a18; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
            Visit Our Website 🌐
          </a>
        </div>

        <p style="color: #555; font-size: 13px;">
          Thanks for choosing <strong>Vivato</strong>. We're excited to have you onboard! 💛
        </p>

        <p style="color: #555; font-size: 13px;">
          — Team Vivato
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Vivato. All rights reserved.
      </div>

    </div>
  </div>
`;
};

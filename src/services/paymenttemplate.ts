export const paymentSuccessTemplate = ({
  customerName,
  email,
  contact,
  address,
  orderDetails,
  callbackUrl,
}: {
  customerName: string;
  email: string;
  contact: string;
  address: string;
  orderDetails: {
    orderId: string;
    restaurantName: string;
    amountPaid: number;
    status: string;
    createdAt: Date;
  };
  callbackUrl: string;
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Order Received</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="
            background-color:#ffffff;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 2px 10px rgba(0,0,0,0.08);
          "
        >
          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                background-color:#f97316;
                padding:24px;
                color:#ffffff;
                font-size:28px;
                font-weight:bold;
              "
            >
              Vivato 🍴
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;color:#333333;">
              <h2 style="margin-top:0;">
                Payment Successful 🎉
              </h2>

              <div style="font-size:16px;line-height:1.6;">
                <p>
                  Hi <strong> ${customerName}</strong>
                </p>,

                <p>
                  <strong>Email: ${email}</strong></br>
                  <strong>Contact: ${contact}</strong></br>
                  <strong>Address: ${address}</strong>
                </p>
              </div>

              <p style="font-size:16px;line-height:1.6;">
                Your payment was successful and your order has been sent to the restaurant for confirmation.
              </p>

              <!-- Order Card -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  margin-top:24px;
                  border:1px solid #e5e5e5;
                  border-radius:8px;
                  overflow:hidden;
                "
              >
                <tr>
                  <td
                    style="
                      padding:16px;
                      background-color:#fafafa;
                      border-bottom:1px solid #e5e5e5;
                    "
                  >
                    <strong>Order Details</strong>
                  </td>
                </tr>

                <tr>
                  <td style="padding:16px;">
                    <p style="margin:8px 0;">
                      <strong>Order ID:</strong> ${orderDetails.orderId}
                    </p>

                    <p style="margin:8px 0;">
                      <strong>Restaurant:</strong> ${orderDetails.restaurantName}
                    </p>

                    <p style="margin:8px 0;">
                      <strong>Amount Paid:</strong> ₹${orderDetails.amountPaid}
                    </p>

                    <p style="margin:8px 0;">
                      <strong>Order Status:</strong> ${orderDetails.status.toUpperCase()}
                    </p>

                    <p style="margin:8px 0;">
                      <strong>Order Created:</strong> ${orderDetails.createdAt}
                    </p>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin: 25px 0;">
                <a href=${callbackUrl}/order-status
                  style="background: #ff7a18; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
                  Your Order Status 🍽️
                </a>
              </div>

              <p
                style="
                  margin-top:24px;
                  font-size:15px;
                  line-height:1.6;
                  color:#666666;
                "
              >
                The restaurant will confirm your order shortly.
              </p>

              <p
                style="
                  margin-top:32px;
                  font-size:16px;
                  font-weight:bold;
                "
              >
                Thank you for ordering with Vivato 🍽️
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding:20px;
                background-color:#fafafa;
                color:#888888;
                font-size:13px;
              "
            >
              © ${new Date().getFullYear()} Vivato. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

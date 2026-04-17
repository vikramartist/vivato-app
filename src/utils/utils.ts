export const roleRequestChange = (email: string, name: string) => {
  return `<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background: linear-gradient(90deg, #f97316, #fb923c); padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">Vivato 🍽️</h1>
      <p style="color: #fff7ed; margin-top: 5px;">Role Upgrade Request</p>
    </div>

    <!-- Body -->
    <div style="padding: 25px; color: #374151;">
      
      <h2 style="margin-top: 0;">New Role Change Request</h2>

      <p>
        Hello Vivato Team,
      </p>

      <p>
        A user ${email} has submitted a request to upgrade their account role on <strong>Vivato</strong>.
        They would like to transition from a <strong>Customer</strong> role to an <strong>Owner</strong> role in order to start managing and creating restaurants on the platform.
      </p>

      <!-- User Info -->
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>User Name:</strong>${name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 5px 0;"><strong>Current Role:</strong> Customer</p>
        <p style="margin: 5px 0;"><strong>Requested Role:</strong> Owner</p>
      </div>

      <!-- Message -->
      <p>
        The user has expressed interest in expanding their engagement with Vivato by becoming a restaurant owner. This role will allow them to:
      </p>

      <ul>
        <li>Create and manage restaurant listings</li>
        <li>Upload menus and manage food items</li>
        <li>Reach customers through the Vivato platform</li>
      </ul>

      <p>
        Please review this request and take the necessary action to approve or reject the role upgrade.
      </p>

      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background-color: #f97316; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Review Request
        </a>
      </div>

      <p>
        If you have any questions or require further verification, feel free to reach out to the user directly.
      </p>

      <p style="margin-top: 30px;">
        Regards,<br />
        <strong>Vivato System</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
      <p style="margin: 0;">This is an automated message from Vivato.</p>
      <p style="margin: 5px 0;">© 2026 Vivato. All rights reserved.</p>
    </div>

  </div>
</div>`;
};

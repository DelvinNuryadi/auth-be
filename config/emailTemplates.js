export const EMAIL_VERIFY_TEMPLATES = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #333;">Email Verification</h2>
    <p style="font-size: 16px; color: #555;">Hi <strong>{{email}}</strong>,</p>
    <p style="font-size: 16px; color: #555;">Please use the following OTP code to verify your email address:</p>
    <div style="font-size: 28px; font-weight: bold; color: #2d89ef; text-align: center; margin: 20px 0;">
      {{otp}}
    </div>
    <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
    <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
  </div>
`;

export const PASSWORD_RESET_TEMPLATE = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ddd; border-radius: 10px; background-color: #fff;">
    <h2 style="color: #e63946;">Reset Your Password</h2>
    <p style="font-size: 16px; color: #333;">Hello,</p>
    <p style="font-size: 16px; color: #444;">
      We received a request to reset the password for the account with the email:
      <strong>{{email}}</strong>
    </p>
    <p style="font-size: 16px; color: #444;">
      Use the OTP below to reset your password:
    </p>
    <div style="font-size: 28px; font-weight: bold; color: #1d3557; text-align: center; margin: 24px 0;">
      {{otp}}
    </div>
    <p style="font-size: 14px; color: #666;">
      This OTP is only valid for the next 10 minutes.
    </p>
    <p style="font-size: 14px; color: #999; margin-top: 30px;">
      If you didn’t request a password reset, you can ignore this email.
    </p>
    <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
    <p style="font-size: 12px; color: #aaa; text-align: center;">
      Your Company. All rights reserved.
    </p>
  </div>
`;

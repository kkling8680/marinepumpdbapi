"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailForPasswordChangeTemplate = exports.verifyEmailonRegistrationTemplate = void 0;
const verifyEmailonRegistrationTemplate = (token) => {
    return (`
    <html>
      <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f9f9f9; text-align:center;">
        <div style="max-width:600px; margin:40px auto; background:#fff; padding:30px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
          
          <h1 style="color:#032247; margin-bottom:20px;">PumpDB</h1>
          
          <p style="font-size:16px; color:#333; margin-bottom:12px;">
            Your one-time email verification code is:
          </p>
          
          <h2 style="color:#032247; font-size:28px; letter-spacing:2px; margin:20px 0;">
            ${token}
          </h2>
          
          <p style="font-size:14px; color:#555; margin-top:20px;">
            Copy and paste this code to complete your email verification.
          </p>
          
          <div style="margin-top:40px; font-size:12px; color:#999;">
            <p>— The PumpDB Team</p>
          </div>
        </div>
      </body>
    </html>    
  `);
};
exports.verifyEmailonRegistrationTemplate = verifyEmailonRegistrationTemplate;
const verifyEmailForPasswordChangeTemplate = (token) => {
    return (`
    <html>
      <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f9f9f9; text-align:center;">
        <div style="max-width:600px; margin:40px auto; background:#fff; padding:30px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
          
          <h1 style="color:#032247; margin-bottom:20px;">PumpDB</h1>
          
          <p style="font-size:16px; color:#333; margin-bottom:12px;">
            Your one-time verification code to reset your password is:
          </p>
          
          <h2 style="color:#032247; font-size:28px; letter-spacing:2px; margin:20px 0;">
            ${token}
          </h2>
          
          <p style="font-size:14px; color:#555; margin-top:20px;">
            Copy and paste this code to securely reset your password.
          </p>
          
          <div style="margin-top:40px; font-size:12px; color:#999;">
            <p>— The PumpDB Team</p>
          </div>
        </div>
      </body>
    </html>    
  `);
};
exports.verifyEmailForPasswordChangeTemplate = verifyEmailForPasswordChangeTemplate;

/**
 * Email Service
 * Sends download links to customers after purchase
 */

// For production, install: npm install resend
// import { Resend } from 'resend';

interface SendDownloadEmailParams {
  to: string;
  themeName: string;
  downloadUrl: string;
  expiresInDays?: number;
}

/**
 * Send download email to customer
 * 
 * In production with Resend:
 * 1. npm install resend
 * 2. Set RESEND_API_KEY in .env.local
 * 3. Uncomment the Resend implementation below
 */
export async function sendDownloadEmail(params: SendDownloadEmailParams): Promise<boolean> {
  const { to, themeName, downloadUrl, expiresInDays = 7 } = params;

  // Development: Log instead of sending
  if (process.env.NODE_ENV === "development") {
    console.log("=".repeat(60));
    console.log("📧 EMAIL WOULD BE SENT (development mode)");
    console.log("=".repeat(60));
    console.log(`To: ${to}`);
    console.log(`Subject: Your ${themeName} Theme is Ready!`);
    console.log(`Download URL: ${downloadUrl}`);
    console.log(`Expires in: ${expiresInDays} days`);
    console.log("=".repeat(60));
    return true;
  }

  // Production with Resend
  try {
    // Uncomment when Resend is installed:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'Theme Bundle <noreply@themebundle.com>',
      to,
      subject: `Your ${themeName} Theme is Ready!`,
      html: generateEmailHtml({ themeName, downloadUrl, expiresInDays }),
    });
    */

    // Fallback: log in production if Resend not configured
    console.log(`[Email] Would send to ${to}: Download link for ${themeName}`);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Generate HTML email template
 */
export function generateEmailHtml(params: {
  themeName: string;
  downloadUrl: string;
  expiresInDays: number;
}): string {
  const { themeName, downloadUrl, expiresInDays } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your ${themeName} Theme is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 40px;">
          <tr>
            <td align="center">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                🎨 Theme Bundle
              </h1>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: white; padding: 40px; border-radius: 0 0 16px 16px;">
          <tr>
            <td>
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 24px;">
                Thank you for your purchase!
              </h2>
              
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Your custom theme <strong>"${themeName}"</strong> is ready for download. 
                Click the button below to get your theme bundle with all 19 platform formats.
              </p>

              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Download Your Theme Bundle
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 32px 0;">
                ⏰ This link expires in ${expiresInDays} days
              </p>

              <!-- What's Included -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <h3 style="color: #18181b; margin: 0 0 16px 0; font-size: 16px;">
                      What's included:
                    </h3>
                    <ul style="color: #52525b; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>19 platform formats (VS Code, iTerm, Vim, etc.)</li>
                      <li>Terminal emulators (Alacritty, Windows Terminal, Hyper)</li>
                      <li>Code editors (Sublime Text, JetBrains, Notepad++)</li>
                      <li>Browser themes (Chrome, Firefox)</li>
                      <li>Apps (Slack, Raycast, Insomnia)</li>
                      <li>Installation guides for each platform</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Support -->
              <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0;">
                Need help? Reply to this email or visit our 
                <a href="https://themebundle.com/support" style="color: #6366f1;">support page</a>.
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px;">
          <tr>
            <td align="center">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Theme Bundle. All rights reserved.<br>
                You're receiving this email because you purchased a theme.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Send purchase confirmation email (optional)
 */
export async function sendPurchaseConfirmation(params: {
  to: string;
  themeName: string;
  amount: number;
  currency: string;
}): Promise<boolean> {
  // Similar implementation as above
  console.log(`[Email] Purchase confirmation for ${params.themeName} to ${params.to}`);
  return true;
}

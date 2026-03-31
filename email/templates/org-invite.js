import { baseLayout, ctaButton, muted, escHtml, avatar } from './base.js';

/**
 * Org invite email — sent when a user is invited to join an organization.
 *
 * @param {object} data
 * @param {string} data.orgName       - Organization name
 * @param {string} data.orgSlug       - Org slug (for URL)
 * @param {string} [data.orgLogoUrl]  - Org logo URL
 * @param {string} data.inviterName   - Display name of the person inviting
 * @param {string} data.inviterAvatar - Avatar URL of inviter
 * @param {string} data.role          - Role being offered (admin, maintain, write, read)
 * @param {string} data.inviteUrl     - Full invite acceptance URL
 * @param {string} [data.message]     - Optional personal message
 * @returns {{ subject: string, html: string }}
 */
export function orgInvite(data) {
  const {
    orgName, orgSlug, orgLogoUrl,
    inviterName, inviterAvatar,
    role, inviteUrl, message,
  } = data;

  const roleLabels = { admin: 'Admin', maintain: 'Maintainer', write: 'Writer', read: 'Reader' };
  const roleColors = { admin: '#c4b5fd', maintain: '#93c5fd', write: '#86efac', read: '#9ca3af' };
  const roleLabel = roleLabels[role] || role;
  const roleColor = roleColors[role] || '#9ca3af';

  const subject = `You're invited to join ${orgName} on LixBlogs`;

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.6">
      <strong style="color:#ffffff">${escHtml(inviterName)}</strong> has invited you to join
      <strong style="color:#ffffff">${escHtml(orgName)}</strong> as a
      <span style="color:${roleColor};font-weight:600">${escHtml(roleLabel)}</span>.
    </p>

    <!-- Org card -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0c1017;border:1px solid #1e2736;border-radius:12px;overflow:hidden">
      <tr>
        <td style="padding:20px">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:14px;vertical-align:top">
              ${avatar(orgLogoUrl, orgName, 44)}
            </td>
            <td style="vertical-align:top">
              <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff">${escHtml(orgName)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6b7f99">@${escHtml(orgSlug)}</p>
            </td>
          </tr></table>
        </td>
      </tr>
    </table>

    ${message ? `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;background-color:#0c1017;border:1px solid #1e2736;border-radius:12px;overflow:hidden">
      <tr>
        <td style="padding:16px 20px">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;vertical-align:top">
              ${avatar(inviterAvatar, inviterName, 28)}
            </td>
            <td style="vertical-align:top">
              <p style="margin:0;font-size:11px;color:#6b7f99;font-weight:600">${escHtml(inviterName)} says:</p>
              <p style="margin:6px 0 0;font-size:13px;color:#d1d5db;line-height:1.5;font-style:italic">"${escHtml(message)}"</p>
            </td>
          </tr></table>
        </td>
      </tr>
    </table>` : ''}

    ${ctaButton('Accept Invitation', inviteUrl)}

    ${muted(`If you don't want to join, you can ignore this email. The invitation will expire automatically.`)}
    ${muted(`Or copy this link: <a href="${escHtml(inviteUrl)}" style="color:#9b7bf7;text-decoration:none;word-break:break-all">${escHtml(inviteUrl)}</a>`)}
  `;

  return {
    subject,
    html: baseLayout({ title: subject, body, preheader: `${inviterName} invited you to ${orgName}` }),
  };
}

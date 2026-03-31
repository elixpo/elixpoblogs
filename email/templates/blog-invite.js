import { baseLayout, ctaButton, muted, escHtml, avatar } from './base.js';

/**
 * Blog collaboration invite — sent when a user is invited as a co-author.
 *
 * @param {object} data
 * @param {string} data.blogTitle       - Blog title
 * @param {string} [data.blogEmoji]     - Page emoji
 * @param {string} data.inviterName     - Who is inviting
 * @param {string} [data.inviterAvatar] - Inviter avatar URL
 * @param {string} data.role            - Co-author role (viewer, editor, admin)
 * @param {string} data.editUrl         - URL to the blog editor
 * @param {string} [data.message]       - Optional personal note
 * @returns {{ subject: string, html: string }}
 */
export function blogInvite(data) {
  const {
    blogTitle, blogEmoji,
    inviterName, inviterAvatar,
    role, editUrl, message,
  } = data;

  const roleLabels = { viewer: 'Viewer', editor: 'Editor', admin: 'Admin' };
  const roleLabel = roleLabels[role] || role;
  const displayTitle = blogEmoji ? `${blogEmoji} ${blogTitle}` : blogTitle;

  const subject = `${inviterName} invited you to collaborate on "${blogTitle}"`;

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.6">
      <strong style="color:#ffffff">${escHtml(inviterName)}</strong> wants you to collaborate on a blog post as
      <strong style="color:#c4b5fd">${escHtml(roleLabel)}</strong>.
    </p>

    <!-- Blog card -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0c1017;border:1px solid #1e2736;border-radius:12px;overflow:hidden">
      <tr>
        <td style="padding:20px">
          <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;line-height:1.4">${escHtml(displayTitle || 'Untitled')}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#6b7f99">
            by ${escHtml(inviterName)} &middot; You'll be added as ${escHtml(roleLabel)}
          </p>
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

    ${ctaButton('Open in Editor', editUrl)}

    ${muted(`If you don't recognize this invitation, you can safely ignore it.`)}
  `;

  return {
    subject,
    html: baseLayout({ title: subject, body, preheader: `Collaborate on "${blogTitle}" with ${inviterName}` }),
  };
}

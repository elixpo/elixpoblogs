import { baseLayout, ctaButton, muted, escHtml } from './base.js';

/**
 * Welcome email — sent after a user completes onboarding.
 *
 * @param {object} data
 * @param {string} data.displayName  - User's display name
 * @param {string} data.username     - Username
 * @param {string} [data.avatarUrl]  - Avatar URL
 * @returns {{ subject: string, html: string }}
 */
export function welcome(data) {
  const { displayName, username } = data;
  const name = displayName || username;

  const subject = `Welcome to LixBlogs, ${name}!`;

  const body = `
    <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#ffffff">Welcome aboard!</p>
    <p style="margin:0 0 24px;font-size:15px;color:#d1d5db;line-height:1.6">
      Hey <strong style="color:#ffffff">${escHtml(name)}</strong>, your LixBlogs account is ready.
      Here's what you can do next:
    </p>

    <!-- Feature cards -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px">
      ${featureCard('create-outline', 'Write your first blog', 'Use our block editor with AI assistance, image embeds, code blocks, and more.')}
      ${featureCard('people-outline', 'Create an organization', 'Collaborate with your team. Invite members, create collections, publish together.')}
      ${featureCard('person-add-outline', 'Complete your profile', 'Add a bio, location, social links, and pronouns so readers know who you are.')}
    </table>

    ${ctaButton('Start Writing', `https://blogs.elixpo.com/new-blog`)}

    ${muted(`Your profile lives at <a href="https://blogs.elixpo.com/${escHtml(username)}" style="color:#9b7bf7;text-decoration:none">blogs.elixpo.com/${escHtml(username)}</a>`)}
  `;

  return {
    subject,
    html: baseLayout({ title: subject, body, preheader: `Your LixBlogs account is ready. Start writing!` }),
  };
}

function featureCard(icon, title, desc) {
  return `
    <tr>
      <td style="padding:12px 16px;background-color:#0c1017;border:1px solid #1e2736;border-radius:10px;margin-bottom:8px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;padding-right:12px;padding-top:2px">
            <span style="font-size:18px;color:#9b7bf7">&#9679;</span>
          </td>
          <td style="vertical-align:top">
            <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff">${title}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7f99;line-height:1.5">${desc}</p>
          </td>
        </tr></table>
      </td>
    </tr>
    <tr><td style="height:8px"></td></tr>`;
}

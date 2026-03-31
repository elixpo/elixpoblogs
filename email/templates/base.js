/**
 * Base email layout wrapper.
 * All templates use this to get consistent header, footer, and styling.
 *
 * @param {object} opts
 * @param {string} opts.title    - Email subject / preview title
 * @param {string} opts.body     - Inner HTML content
 * @param {string} [opts.preheader] - Hidden preheader text for inbox preview
 * @returns {string} Full HTML email
 */
export function baseLayout({ title, body, preheader = '' }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escHtml(title)}</title>
  <!--[if mso]>
  <style>body,table,td{font-family:Arial,Helvetica,sans-serif!important}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0c1017;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#e8edf5;-webkit-text-size-adjust:100%">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escHtml(preheader)}${'&zwnj;&nbsp;'.repeat(30)}</div>` : ''}

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c1017">
    <tr><td align="center" style="padding:40px 16px">

      <!-- Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#111823;border:1px solid #1e2736;border-radius:16px;overflow:hidden">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 20px;border-bottom:1px solid #1e2736">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:10px;vertical-align:middle">
                <img src="https://blogs.elixpo.com/logo.png" alt="LixBlogs" width="28" height="28" style="display:block;border-radius:6px" />
              </td>
              <td style="vertical-align:middle">
                <span style="font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">LixBlogs</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #1e2736">
            <p style="margin:0;font-size:12px;color:#5a657a;line-height:1.6">
              You received this email because of your account on
              <a href="https://blogs.elixpo.com" style="color:#9b7bf7;text-decoration:none">LixBlogs</a>.
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#3d4a5e">
              &copy; ${new Date().getFullYear()} Elixpo &middot;
              <a href="https://blogs.elixpo.com/about" style="color:#5a657a;text-decoration:none">About</a>
            </p>
          </td>
        </tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`;
}

/** Escape HTML entities */
export function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Reusable primary CTA button */
export function ctaButton(text, href) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px">
      <tr>
        <td style="background-color:#9b7bf7;border-radius:10px;padding:12px 28px">
          <a href="${escHtml(href)}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;letter-spacing:0.2px">${escHtml(text)}</a>
        </td>
      </tr>
    </table>`;
}

/** Secondary muted link */
export function secondaryLink(text, href) {
  return `<a href="${escHtml(href)}" style="color:#9b7bf7;font-size:13px;text-decoration:none">${escHtml(text)}</a>`;
}

/** Small muted paragraph */
export function muted(text) {
  return `<p style="margin:16px 0 0;font-size:12px;color:#6b7f99;line-height:1.5">${text}</p>`;
}

/** Avatar circle (inline) */
export function avatar(url, name, size = 40) {
  if (url) {
    return `<img src="${escHtml(url)}" alt="" width="${size}" height="${size}" style="border-radius:50%;display:block;object-fit:cover" />`;
  }
  const initial = (name || '?')[0].toUpperCase();
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background-color:#1a2030;color:#7c8a9e;font-size:${Math.round(size * 0.4)}px;font-weight:700;line-height:${size}px;text-align:center">${initial}</div>`;
}

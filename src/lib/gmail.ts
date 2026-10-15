interface ComposeOptions {
  /** Gmail account to send from; Gmail switches to it if the browser is signed in. */
  from: string;
  to: string;
  subject: string;
}

/**
 * Opens Gmail's compose window in a specific account. Unlike `mailto:` (which
 * uses whatever mail app/account the device prefers), this keeps replies to
 * readers coming from the site's official address.
 */
export function gmailComposeUrl({ from, to, subject }: ComposeOptions): string {
  const params = new URLSearchParams({ authuser: from, view: "cm", fs: "1", to, su: subject });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

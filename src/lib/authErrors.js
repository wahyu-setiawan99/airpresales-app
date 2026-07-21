// Map raw Supabase auth errors to clear, human-friendly messages.
export function friendlyAuthError(error) {
  if (!error) return null
  const msg = (error.message || '').toLowerCase()

  if (msg.includes('invalid login credentials'))
    return 'That email or password is incorrect.'
  if (msg.includes('email not confirmed'))
    return 'Please confirm your email first — check your inbox for the link.'
  if (msg.includes('user already registered') || msg.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.'
  if (msg.includes('password should be at least'))
    return 'Password is too short — use at least 6 characters.'
  if (msg.includes('should be different'))
    return 'Your new password must be different from the old one.'
  if (msg.includes('unable to validate email') || msg.includes('invalid email'))
    return 'That doesn’t look like a valid email address.'
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Too many attempts. Please wait a minute and try again.'
  if (msg.includes('for security purposes'))
    return 'Please wait a moment before requesting another email.'
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Network problem — check your connection and try again.'

  // Fallback: show the original message, capitalised.
  return error.message ? error.message.charAt(0).toUpperCase() + error.message.slice(1) : 'Something went wrong.'
}

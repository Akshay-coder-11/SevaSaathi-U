/**
 * Helper to determine if email verification is compulsory for a user account.
 * 
 * - Existing users registered before July 16, 2026 09:00:00 UTC do NOT require verification.
 * - Simulated/Demo users do NOT require verification.
 * - Future registrations starting now require compulsory verification.
 */
export const isVerificationCompulsory = (user) => {
  if (!user) return false;

  // Simulated/Demo accounts do not require verification
  const userIdStr = String(user._id || user.id || '');
  if (userIdStr.startsWith('cust_') || userIdStr.startsWith('prov_') || userIdStr.startsWith('admin_')) {
    return false;
  }

  // Handle default accounts by email
  const emailStr = String(user.email || '').toLowerCase();
  if (
    emailStr === 'customer@sevasaathi.com' ||
    emailStr === 'provider@sevasaathi.com' ||
    emailStr === 'admin@sevasaathi.com'
  ) {
    return false;
  }

  // Cutoff date set to July 16, 2026 09:00:00 UTC
  const cutoff = new Date('2026-07-16T09:00:00.000Z');
  
  // If user joined before the cutoff, verification is not compulsory
  if (user.joinedAt && new Date(user.joinedAt) < cutoff) {
    return false;
  }

  return true;
};

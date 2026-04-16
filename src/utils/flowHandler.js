/**
 * Called on Login submit.
 * Returns { type, message? } for errors
 * Returns { type, user, nextScreen, institute?, role? } for success
 */
export const handleLoginFlow = (email, password, USERS) => {
  const record = USERS[email?.trim().toLowerCase()];

  // ─── UseCase 5: Invalid credentials ──────────────────────────────────────
  if (!record || record.password !== password) {
    return { type: "ERROR", message: "Invalid credentials. Please try again." };
  }

  const { user } = record;

  // ─── Edge: user object missing or no institutes assigned ─────────────────
  if (!user || !user.institutes || user.institutes.length === 0) {
    return { type: "ERROR", message: "No institute assigned to this account." };
  }

  const { institutes } = user;

  // ─── UseCase 2 & 3: Multiple institutes → go to institute selection ───────
  if (institutes.length > 1) {
    return { type: "SUCCESS", user, nextScreen: "SELECT_INSTITUTE" };
  }

  // Single institute from here
  const onlyInstitute = institutes[0];

  // ─── UseCase 4: 1 Institute + Multiple roles → go to role selection ───────
  if (onlyInstitute.roles.length > 1) {
    return {
      type: "SUCCESS",
      user,
      nextScreen: "SELECT_ROLE",
      institute: onlyInstitute,
    };
  }

  // ─── UseCase 1: 1 Institute + 1 Role → go directly to dashboard ──────────
  return {
    type: "SUCCESS",
    user,
    nextScreen: "DASHBOARD",
    institute: onlyInstitute,
    role: onlyInstitute.roles[0],
  };
};

/**
 * Called when user picks an institute from the list.
 * Returns nextScreen + role (if auto-resolved)
 */
export const handleInstituteSelect = (institute) => {
  if (!institute) return { nextScreen: "SELECT_INSTITUTE" };

  // UseCase 3: Selected institute has multiple roles
  if (institute.roles.length > 1) {
    return { nextScreen: "SELECT_ROLE" };
  }

  // UseCase 2: Selected institute has only 1 role → auto-resolve
  return { nextScreen: "DASHBOARD", role: institute.roles[0] };
};

// utils/config.js

export const CONFIG = {
  BASE_URL: "http://localhost:3000",

  PASSWORD: "1234",

  // ── Flat exports (used directly in login_spec.js) ──────────────────────────
  NO_INST_EMAIL: "ayushnakade@scos.com",
  SINGLE_ROLE_EMAIL: "jameswilson@scos.com",
  MULTI_ROLE_EMAIL: "emily.davis@scos.com",
  MULTI_INST_MULTI_ROLE_EMAIL: "michael.ross@scos.com",
  MULTI_INST_SINGLE_ROLE_EMAIL: "sarah.parker@scos.com",

  // ── Nested (optional, for other uses) ─────────────────────────────────────
  USERS: {
    invalid: { email: "wrong@mail.com", password: "wrong" },
    noInstitute: { email: "ayushnakade@scos.com", password: "1234" },
    singleRole: { email: "jameswilson@scos.com", password: "1234" },
    multiRole: { email: "emily.davis@scos.com", password: "1234" },
    multiInstMultiRole: { email: "michael.ross@scos.com", password: "1234" },
    multiInstSingleRole: { email: "sarah.parker@scos.com", password: "1234" },
  },
};

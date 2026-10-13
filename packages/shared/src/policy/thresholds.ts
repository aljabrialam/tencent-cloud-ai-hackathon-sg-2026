// Demo defaults — single source of truth (docs/policy-rules.md).
export const T = {
  PIN_MAX_CENTS: 500_00,            // POL-TIER-01
  BIO_MAX_CENTS: 5_000_00,          // POL-TIER-02 → above this = OOB
  NEWPAYEE_OOB_CENTS: 1_000_00,     // POL-NEWPAYEE-02
  KNOWN_PAYEE_DAYS: 90,             // POL-TIER-01 window
  VEL_COUNT: 5,                     // POL-VEL-01
  VEL_WINDOW_MS: 10 * 60 * 1000,
  VEL_DAILY_CENTS: 20_000_00,       // POL-VEL-02
  ANOMALY_MULT: 10,                 // POL-ANOM-01
  ANOMALY_N: 20,
  EXPIRE_MS: 60_000,                // POL-EXPIRE-01
} as const;

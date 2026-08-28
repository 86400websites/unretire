import { test as setup } from "../fixtures";
import { signInAs } from "../helpers/auth";

// Fixture 3 in docs/ENVIRONMENT-PARITY.md §5.5. The course entitlement row
// itself arrives with the S2.5 schema replication; S2.3 stores the session.
setup(
  "course fixture: sign in and store the session (proof P1)",
  async ({ page, baseURL }) => {
    await signInAs(page, "course", baseURL);
  },
);

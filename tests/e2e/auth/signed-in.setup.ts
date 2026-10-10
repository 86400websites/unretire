import { test as setup } from "../fixtures";
import { signInAs } from "../helpers/auth";

// Fixture 2 in docs/ENVIRONMENT-PARITY.md §5.5: an account with no entitlement.
setup(
  "signed-in fixture: sign in and store the session (proof P1)",
  async ({ page, baseURL }) => {
    await signInAs(page, "signed-in", baseURL);
  },
);

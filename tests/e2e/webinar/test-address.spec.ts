import fs from "node:fs";
import path from "node:path";
import { test, expect } from "../fixtures";
import {
  TEST_ADDRESS,
  isTestAddress,
} from "../../../src/lib/webinar/test-address";

/**
 * Sprint S6.2 — the D-22 test-address rule (src/lib/webinar/test-address.ts):
 * an automated or practice sign-up is never counted on the webinar report.
 * FEATURE-LIST line IN-009 (a draft until the owner approves it at Gate B).
 *
 * THREE COPIES OF ONE RULE. The site's copy is new in this sprint. The same
 * pattern already guards scripts/webinar-funnel.mjs (a dependency-free script,
 * which cannot import TypeScript) and tests/e2e/helpers/parity.ts (which
 * builds the addresses the parity specs type). Neither file exports its
 * pattern, so both are read here as TEXT: the one `const NAME = /…/flags;`
 * line is found, rebuilt with new RegExp(source, flags), and run against the
 * same addresses as the site's copy. A copy edited on its own turns this file
 * red.
 *
 * ONE DELIBERATE DIFFERENCE: CAPITALS. The site's copy and the script's carry
 * the `i` flag, because a person can type their address in capitals and is
 * still a test address. parity.ts's copy has no flag: its fixed
 * "+ur-e2e-"/"+ur-test-" prefix and its tag body ([a-z0-9-]) take lower case
 * only, while the part before the plus and the domain take any case. That is
 * right for what it guards — it only ever checks an address ownerAddress()
 * has just built from a lower-case tag and a lower-cased run id
 * (tests/e2e/helpers/parity.ts:54-57) — and the capitals test below asserts
 * exactly that behaviour, so the difference cannot widen unnoticed.
 *
 * Nothing here makes a request.
 */

const ROOT = path.join(__dirname, "..", "..", "..");

function read(relative: string): string {
  // The worktree is CRLF on Windows and LF in CI; compare one way.
  return fs
    .readFileSync(path.join(ROOT, relative), "utf8")
    .replace(/\r\n/g, "\n");
}

/** The pattern of the one `const <name> = /…/flags;` line in a file. */
function patternIn(relative: string, name: string): RegExp {
  const found = [
    ...read(relative).matchAll(
      new RegExp(`^const ${name} = /(.+)/([a-z]*);$`, "gm"),
    ),
  ];
  if (found.length !== 1) {
    throw new Error(
      `${relative}: expected one "const ${name} = /…/;" line, found ${found.length}.`,
    );
  }
  const [, source = "", flags = ""] = found[0]!;
  return new RegExp(source, flags);
}

const SCRIPT = patternIn("scripts/webinar-funnel.mjs", "TEST_ADDRESS");
const PARITY = patternIn("tests/e2e/helpers/parity.ts", "PLUS_TAG_SHAPE");

/** The answer of every copy, by name, for one address. */
function answers(address: string): Record<string, boolean> {
  return {
    "src TEST_ADDRESS": TEST_ADDRESS.test(address),
    "src isTestAddress": isTestAddress(address),
    "scripts/webinar-funnel.mjs": SCRIPT.test(address),
    "tests/e2e/helpers/parity.ts": PARITY.test(address),
  };
}

function all(value: boolean): Record<string, boolean> {
  return {
    "src TEST_ADDRESS": value,
    "src isTestAddress": value,
    "scripts/webinar-funnel.mjs": value,
    "tests/e2e/helpers/parity.ts": value,
  };
}

test.describe("S6.2 test addresses — one rule, three copies", () => {
  test("IN-009 each file holds exactly one copy, and the three are the same pattern", () => {
    expect(SCRIPT.source).toBe(TEST_ADDRESS.source);
    expect(PARITY.source).toBe(TEST_ADDRESS.source);
    // Case-insensitive on the site and in the script; see the header note.
    expect(TEST_ADDRESS.flags).toBe("i");
    expect(SCRIPT.flags).toBe("i");
    expect(PARITY.flags).toBe("");
  });

  test("IN-009 all three accept the same lower-case test addresses", () => {
    const accepted = [
      "owner+ur-test-x@example.com",
      "owner+ur-e2e-x@example.com",
      // The shape scripts/webinar-funnel.mjs builds (campaign, run, attempt, letter).
      "owner+ur-test-conv1-123456-1-a@example.com",
      // The two shapes parity.ts builds.
      "owner+ur-e2e-p2-local-1700000000000@example.com",
      "owner+ur-test-s25-12345@example.com",
      "first.last+ur-test-1@example.co.uk",
      "owner+ur-e2e-9z-8y@mail.example.com",
      "o+ur-e2e-0@e",
      "owner+ur-test-x@localhost",
      "owner+ur-test---@example.com",
    ];
    for (const address of accepted) {
      expect(answers(address), address).toEqual(all(true));
    }
  });

  test("IN-009 all three refuse the same lower-case addresses", () => {
    const refused: [string, string][] = [
      ["owner@example.com", "no plus-tag"],
      ["owner+newsletter@example.com", "a plus-tag that is not a test tag"],
      ["owner+test-x@example.com", "the ur- prefix missing"],
      ["owner+ur-prod-x@example.com", "neither e2e nor test"],
      ["owner+ur-tests-x@example.com", "tests is not test"],
      ["owner+ur-e2ex@example.com", "no dash after e2e"],
      ["owner+ur-test@example.com", "no tag after the prefix"],
      ["owner+ur-test-@example.com", "an empty tag"],
      ["owner+ur-test-x@ex@ample.com", "two @"],
      ["owner+ur-test-x@@example.com", "two @ together"],
      ["+ur-test-x@example.com", "nothing before the plus"],
      ["owner+ur-test-x@", "no domain"],
      ["owner+ur-test-x", "no @ at all"],
      ["own er+ur-test-x@example.com", "a space before the plus"],
      ["owner+ur-test-x y@example.com", "a space in the tag"],
      ["owner+ur-test-x@example .com", "a space in the domain"],
      ["owner+ur-test-x@exam\tple.com", "a tab in the domain"],
      ["owner+ur-test-x_y@example.com", "an underscore in the tag"],
      ["owner+ur-test-x.y@example.com", "a dot in the tag"],
      ["owner+extra+ur-test-x@example.com", "a second plus before the tag"],
      ["owner+ur-test-x+y@example.com", "a plus inside the tag"],
      ["owner@example.com+ur-test-x", "the tag after the domain"],
      ["", "an empty string"],
    ];
    for (const [address, why] of refused) {
      expect(answers(address), `${why}: ${JSON.stringify(address)}`).toEqual(
        all(false),
      );
    }
  });

  test("IN-009 capitals: the site's copy and the script's ignore case; parity.ts's refuses them in the tag", () => {
    const capitals: { address: string; parity: boolean; why: string }[] = [
      {
        address: "Owner+UR-TEST-x@Example.com",
        parity: false,
        why: "capitals in the fixed prefix",
      },
      {
        address: "owner+Ur-E2e-run1@example.com",
        parity: false,
        why: "mixed case in the fixed prefix",
      },
      {
        address: "owner+ur-test-X@example.com",
        parity: false,
        why: "a capital in the tag body",
      },
      {
        address: "OWNER+ur-e2e-run1@EXAMPLE.COM",
        parity: true,
        why: "capitals only before the plus and in the domain",
      },
    ];
    for (const { address, parity, why } of capitals) {
      expect(answers(address), `${why}: ${address}`).toEqual({
        ...all(true),
        "tests/e2e/helpers/parity.ts": parity,
      });
    }

    // Capitals never turn an ordinary address into a test address.
    for (const address of [
      "OWNER@EXAMPLE.COM",
      "Owner+UR-PROD-x@Example.com",
      "Owner+UR-TEST-@Example.com",
    ]) {
      expect(answers(address), address).toEqual(all(false));
    }
  });

  test("IN-009 isTestAddress trims surrounding whitespace — the pattern alone does not", () => {
    for (const address of [
      "  owner+ur-test-x@example.com  ",
      "\towner+ur-e2e-1@example.com\n",
      " Owner+UR-TEST-Seat1@Example.com ",
    ]) {
      expect(isTestAddress(address), JSON.stringify(address)).toBe(true);
      expect(TEST_ADDRESS.test(address), JSON.stringify(address)).toBe(false);
    }
    // Whitespace INSIDE the address is still refused.
    expect(isTestAddress(" owner+ur-test-x @example.com ")).toBe(false);
    expect(isTestAddress("   ")).toBe(false);
  });
});

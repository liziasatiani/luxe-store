import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "Home", path: "/" },
  { name: "Beauty", path: "/beauty" },
  { name: "Tech", path: "/tech" },
  { name: "Cart", path: "/cart" },
  { name: "Wishlist", path: "/wishlist" },
  { name: "Checkout", path: "/checkout" },
  { name: "Search", path: "/search?q=serum" },
  { name: "About", path: "/about" },
  { name: "Login", path: "/login" },
  { name: "Register", path: "/register" },
];

for (const { name, path } of PAGES) {
  test(`${name} page has no critical axe violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      // Exclude third-party injected content
      .exclude("[data-toast]")
      // Only report serious violations (critical + serious)
      .options({ resultTypes: ["violations"] })
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (critical.length > 0) {
      const summary = critical.map((v) =>
        `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map((n) => n.target.join(", ")).join(" | ")}`
      ).join("\n\n");
      console.error(`\naxe violations on ${name} (${path}):\n${summary}\n`);
    }

    expect(critical, `${name} page has ${critical.length} critical/serious axe violations`).toHaveLength(0);
  });
}

test("Product page has no critical axe violations", async ({ page }) => {
  // Navigate to beauty to find a real product slug
  await page.goto("/beauty", { waitUntil: "networkidle" });
  const firstProductLink = page.locator("a[href^='/products/']").first();
  const href = await firstProductLink.getAttribute("href");

  if (!href) {
    test.skip();
    return;
  }

  await page.goto(href, { waitUntil: "networkidle" });

  const results = await new AxeBuilder({ page })
    .options({ resultTypes: ["violations"] })
    .analyze();

  const critical = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );

  expect(critical, `Product page has ${critical.length} critical/serious axe violations`).toHaveLength(0);
});

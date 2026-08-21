/**
 * Translates all product text content (description, howToUse, inTheBox)
 * to Georgian (ka), French (fr), and Spanish (es) using the Anthropic API.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/translate-products.js
 *
 * Skips any field that already has a translation. Safe to re-run.
 */

const { PrismaClient } = require("@prisma/client");

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY environment variable is not set.");
  console.error("Get yours at: https://console.anthropic.com/account/keys");
  process.exit(1);
}

const prisma = new PrismaClient();
const LANGS = { ka: "Georgian", fr: "French", es: "Spanish" };

async function translateWithClaude(text, targetLang, targetName) {
  if (!text?.trim()) return null;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Translate the following product description from English to ${targetName}. Return ONLY the translated text, no explanation or extra text.\n\n${text}`,
        },
      ],
    }),
  });

  if (!r.ok) {
    const err = await r.text();
    throw new Error(`API ${r.status}: ${err}`);
  }

  const d = await r.json();
  return d.content?.[0]?.text?.trim() ?? null;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      description_ka: true,
      description_fr: true,
      description_es: true,
      howToUse: true,
      howToUse_ka: true,
      howToUse_fr: true,
      howToUse_es: true,
      inTheBox: true,
      inTheBox_ka: true,
      inTheBox_fr: true,
      inTheBox_es: true,
    },
    orderBy: { name: "asc" },
  });

  console.log(`Translating ${products.length} products to KA, FR, ES...\n`);
  let updated = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    process.stdout.write(`[${i + 1}/${products.length}] ${p.name}... `);

    const patch = {};

    for (const [lang, name] of Object.entries(LANGS)) {
      if (p.description && !p[`description_${lang}`]) {
        const t = await translateWithClaude(p.description, lang, name);
        if (t) patch[`description_${lang}`] = t;
        await sleep(100);
      }
      if (p.howToUse && !p[`howToUse_${lang}`]) {
        const t = await translateWithClaude(p.howToUse, lang, name);
        if (t) patch[`howToUse_${lang}`] = t;
        await sleep(100);
      }
      if (p.inTheBox && !p[`inTheBox_${lang}`]) {
        const t = await translateWithClaude(p.inTheBox, lang, name);
        if (t) patch[`inTheBox_${lang}`] = t;
        await sleep(100);
      }
    }

    if (Object.keys(patch).length > 0) {
      await prisma.product.update({ where: { id: p.id }, data: patch });
      updated++;
      console.log(`✓ (${Object.keys(patch).length} fields)`);
    } else {
      console.log("(already translated, skipped)");
    }
  }

  console.log(`\nDone. Updated ${updated}/${products.length} products.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

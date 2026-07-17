import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const TIER_MULTIPLIER = { Standard: 1, "Deep Clean": 1.6 } as const;

export default defineTool({
  name: "estimate_cleaning",
  title: "Estimate cleaning cost & duration",
  description:
    "Given a property's bedroom count, bathroom count, and pricing tier, returns an estimated cleaning duration (minutes) and price (USD). This is an illustrative estimate, not a quote.",
  inputSchema: {
    bedrooms: z.number().int().min(0).max(20).describe("Number of bedrooms."),
    bathrooms: z.number().min(0).max(20).describe("Number of bathrooms."),
    tier: z.enum(["Standard", "Deep Clean"]).default("Standard").describe("Cleaning pricing tier."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ bedrooms, bathrooms, tier }) => {
    const mult = TIER_MULTIPLIER[tier];
    const durationMin = Math.round((45 + bedrooms * 25 + bathrooms * 20) * mult);
    const priceUsd = Math.round((60 + bedrooms * 25 + bathrooms * 20) * mult);
    const result = { bedrooms, bathrooms, tier, durationMin, priceUsd };
    return {
      content: [
        {
          type: "text",
          text: `Estimated ${tier} cleaning for ${bedrooms} bed / ${bathrooms} bath: ~${durationMin} min, ~$${priceUsd}.`,
        },
      ],
      structuredContent: result,
    };
  },
});

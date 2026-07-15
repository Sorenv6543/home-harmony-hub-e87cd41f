import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_app_info",
  title: "Get app info",
  description:
    "Returns a description of Claro — a short-term rental cleaning and booking management app — including its main features and supported calendar platforms.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "Claro",
      tagline: "Cleaning and booking management for short-term rentals.",
      features: [
        "Property management (add, edit, view properties)",
        "Booking dashboard and timeline",
        "Recurring cleaning schedules per property",
        "Calendar sync with Airbnb, VRBO, and Google Calendar (iCal / OAuth)",
        "Service settings, coverage areas, pricing rules, notifications",
      ],
      supportedCalendarPlatforms: ["Airbnb (iCal)", "VRBO (iCal)", "Google Calendar"],
      pricingTiers: ["Standard", "Deep Clean"],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});

import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "whoami",
  title: "Who am I?",
  description:
    "Returns the signed-in Claro user's ID and email (from the verified OAuth token). Requires authentication.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [{ type: "text", text: "Not authenticated" }],
        isError: true,
      };
    }
    const result = {
      userId: ctx.getUserId(),
      email: ctx.getUserEmail(),
      clientId: ctx.getClientId(),
    };
    return {
      content: [
        {
          type: "text",
          text: `Signed in as ${result.email ?? result.userId ?? "unknown user"}.`,
        },
      ],
      structuredContent: result,
    };
  },
});

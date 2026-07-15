import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoami from "./tools/whoami";

// Authenticated MCP server — mounted at /mcp-admin.
// Callers must present a Supabase OAuth 2.1 bearer token; unauthenticated
// requests are rejected with 401 + a WWW-Authenticate challenge that points
// clients at /.well-known/oauth-protected-resource.
//
// The issuer MUST be the direct supabase.co host (not the .lovable.cloud
// proxy) because Lovable rewrites SUPABASE_URL on publish and mcp-js
// verifies the RFC 8414 issuer match. The project ref is the only
// Supabase value stable across publish.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "claro-admin-mcp",
  title: "Claro Admin MCP",
  version: "0.1.0",
  instructions:
    "Authenticated Claro tools. Callers must sign in as a Claro user. Use `whoami` to verify the connection is authorized.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami],
});

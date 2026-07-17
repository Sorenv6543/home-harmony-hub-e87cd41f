---
name: server-fn
description: Scaffold a new createServerFn handler in src/lib/api/*.functions.ts following Claro's server-logic convention
---

# New server function

Claro uses `createServerFn` handlers in `src/lib/api/*.functions.ts` as its convention for server
logic, instead of Supabase Edge Functions (see `src/lib/api/example.functions.ts`).

## The critical gotcha

Only code inside `.handler()` is guaranteed tree-shaken from the client bundle. **Module-level
code in a `.functions.ts` file still ships to the client** — so:

- Keep server-only imports (like `client.server.ts`) *inside* the handler body, or move shared
  server-only logic into a `.server.ts` file and import that.
- Never import `src/integrations/supabase/client.server.ts` at the top level of a `.functions.ts`
  file. Instead: `const { supabaseAdmin } = await import("@/integrations/supabase/client.server");`
  inside the handler.

## Steps

1. **Pick a file**: group related server fns in one `*.functions.ts` file under `src/lib/api/`,
   e.g. `bookings.functions.ts`. Create a new file if none fits.

2. **Write the handler**:

   ```ts
   import { createServerFn } from "@tanstack/react-start";
   import { z } from "zod";

   export const myServerFn = createServerFn({ method: "POST" })
     .inputValidator(z.object({ /* fields */ }))
     .handler(async ({ data }) => {
       // server-only imports go here, not at module scope:
       // const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
       return { /* result */ };
     });
   ```

   - Use `.inputValidator` with Zod for all inputs — this is the project's validation convention.
   - For one-off env reads, use inline `process.env` inside the handler. For reused server config,
     use a `*.server.ts` module instead (see `src/lib/config.server.ts`).

3. **RLS-scoped data access**: if the fn needs to act as the authenticated user (respecting RLS)
   rather than as service-role, use the `requireSupabaseAuth` middleware
   (`src/integrations/supabase/auth-middleware.ts`) instead of `client.server.ts`:

   ```ts
   export const myServerFn = createServerFn({ method: "POST" })
     .middleware([requireSupabaseAuth])
     .inputValidator(z.object({ /* fields */ }))
     .handler(async ({ data, context }) => {
       // context.supabase, context.userId, context.claims are available here
     });
   ```

   `requireSupabaseAuth` only works because `attachSupabaseAuth` (registered globally in
   `src/start.ts`) puts the bearer token on the outgoing request client-side — nothing extra
   needed on the calling component.

4. **Call it from a component**: `const result = await myServerFn({ data: {...} })`.

## Which pattern to use

- **RLS-scoped, acting as the current user** → `requireSupabaseAuth` middleware +
  `context.supabase`.
- **Admin/service-role, bypasses RLS** → dynamic import of `client.server.ts` inside the handler.
- Don't reach for Supabase Edge Functions — this repo doesn't use them for server logic.

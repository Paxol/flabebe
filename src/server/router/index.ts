// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { slugRouter } from "./slugs";
import { adminSlugRouter } from "./admin/slugs";
import { protectedExampleRouter } from "./protected-example-router";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("slug.", slugRouter)
  .merge("admin.slug.", adminSlugRouter)
  .merge("question.", protectedExampleRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { slugRouter } from "./slugs";
import { adminSlugRouter } from "./admin/slugs";
import { protectedExampleRouter } from "./protected-example-router";
import { adminFileRouter } from "./admin/files";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("slug.", slugRouter)
  .merge("admin.slug.", adminSlugRouter)
  .merge("admin.files.", adminFileRouter)
  .merge("question.", protectedExampleRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { slugRouter } from "./slugs";
import { adminApiRouter } from "./admin/api";
import { adminSlugRouter } from "./admin/slugs";
import { protectedExampleRouter } from "./protected-example-router";
import { adminFileRouter } from "./admin/files";
import { externalRouter } from "./external";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("slug.", slugRouter)
  .merge("admin.api.", adminApiRouter)
  .merge("admin.slug.", adminSlugRouter)
  .merge("admin.files.", adminFileRouter)
  .merge("question.", protectedExampleRouter)
  .merge("external.", externalRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

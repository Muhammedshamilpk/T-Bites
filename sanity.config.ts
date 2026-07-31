import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r1clvwwn";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "default",
  title: "T-Bites Dashboard Studio",

  projectId,
  dataset,

  basePath: "/studio",

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
});

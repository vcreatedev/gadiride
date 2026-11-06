"use client";
import { defineConfig, type WorkspaceOptions } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset as activeDataset, projectId } from "./src/sanity/env";
import { schemaTypes, SINGLETONS } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

/** Types that may not be created or deleted from the Studio (fixed set). */
const FIXED = new Set([...Object.keys(SINGLETONS), "vehicleGroup"]);

const shared: Omit<WorkspaceOptions, "name" | "title" | "basePath" | "dataset"> = {
  projectId: projectId || "missing",
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter((t) => !FIXED.has(t.schemaType)),
      {
        id: "vehicle-by-group",
        title: "Vehicle in group",
        schemaType: "vehicle",
        parameters: [{ name: "group", type: "string" }],
        value: (p: { group: string }) => ({ group: p.group, available: true, featured: false, order: 100, photoFit: "cover", photoBackground: "studio", photoZoom: 100 }),
      },
    ],
  },
  document: {
    actions: (prev, ctx) =>
      FIXED.has(ctx.schemaType) ? prev.filter((a) => a.action && ["publish", "discardChanges", "restore"].includes(a.action)) : prev,
    newDocumentOptions: (prev) => prev.filter((i) => !FIXED.has(i.templateId)),
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
};

const production: WorkspaceOptions = {
  ...shared,
  name: "production",
  title: "Gadiride · LIVE",
  subtitle: "production dataset: changes go to the live website",
  basePath: "/studio/production",
  dataset: "production",
};

const development: WorkspaceOptions = {
  ...shared,
  name: "development",
  title: "Gadiride · DEV",
  subtitle: "development dataset: safe to experiment",
  basePath: "/studio/development",
  dataset: "development",
};

// The workspace matching this deployment's dataset is listed first (it opens by default).
export default defineConfig(activeDataset === "production" ? [production, development] : [development, production]);

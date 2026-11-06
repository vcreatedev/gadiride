"use client";
import { defineConfig, type WorkspaceOptions } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset as activeDataset, productionReadOnly, projectId } from "./src/sanity/env";
import { schemaTypes, SINGLETONS } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { GadirideIcon, makeNavbar, studioTheme } from "./src/sanity/theme";

/** Types that may not be created or deleted from the Studio (fixed set). */
const FIXED = new Set([...Object.keys(SINGLETONS), "vehicleGroup"]);

const shared: Omit<WorkspaceOptions, "name" | "title" | "basePath" | "dataset"> = {
  projectId: projectId || "missing",
  theme: studioTheme,
  icon: GadirideIcon,
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

/**
 * Live data, view only: every document is read-only (Sanity saves drafts as you type, so locking
 * the fields is what stops writes), and there is nothing to publish, delete or create.
 */
const readOnlyLive: Partial<WorkspaceOptions> = {
  schema: { ...shared.schema, types: schemaTypes.map((t) => (t.type === "document" ? { ...t, readOnly: true } : t)) },
  document: { actions: () => [], newDocumentOptions: () => [] },
};

const production: WorkspaceOptions = {
  ...shared,
  name: "production",
  title: productionReadOnly ? "Gadiride · LIVE (view only)" : "Gadiride · LIVE",
  subtitle: productionReadOnly ? "production dataset: view only on this computer" : "production dataset: changes go to the live website",
  basePath: "/admin/production",
  dataset: "production",
  studio: { components: { navbar: makeNavbar(productionReadOnly ? "LIVE data · view only, no changes possible" : "LIVE website", true) } },
  ...(productionReadOnly ? readOnlyLive : {}),
};

const development: WorkspaceOptions = {
  ...shared,
  name: "development",
  title: "Gadiride · DEV",
  subtitle: "development dataset: safe to experiment",
  basePath: "/admin/development",
  dataset: "development",
  studio: { components: { navbar: makeNavbar("DEV: safe to experiment", false) } },
};

// The first workspace opens by default. With live data locked (a local machine), editing happens in
// development, so that opens first; otherwise the workspace matching this deployment's dataset does.
const editFirst = productionReadOnly || activeDataset !== "production";
export default defineConfig(editFirst ? [development, production] : [production, development]);

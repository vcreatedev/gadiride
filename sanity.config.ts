"use client";
import { createElement } from "react";
import { defineConfig, type WorkspaceOptions } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset as activeDataset, projectId } from "./src/sanity/env";
import { schemaTypes, SINGLETONS } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { GadirideIcon, makeNavbar, studioTheme } from "./src/sanity/theme";
import SectionInput from "./src/sanity/SectionInput";
import VisibilityItem from "./src/sanity/VisibilityItem";
import FooterDiscard from "./src/sanity/DraftBar";
import { LiveStatusBadge, withDiscardSummary, withPublishSummary } from "./src/sanity/publishChanges";
import { DEFAULT_LOCATION } from "./src/data/cities";

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
        value: (p: { group: string }) => ({ group: p.group, location: DEFAULT_LOCATION, available: true, featured: false, order: 0, photoFit: "cover", photoBackground: "studio", photoZoom: 100 }),
      },
      {
        id: "type-by-group",
        title: "Vehicle type in group",
        schemaType: "vehicleType",
        parameters: [{ name: "group", type: "string" }],
        value: (p: { group: string }) => ({ group: p.group, order: 100 }),
      },
    ],
  },
  document: {
    // Publish and Discard first list exactly which changes go live, or are thrown away.
    actions: (prev, ctx) =>
      (FIXED.has(ctx.schemaType) ? prev.filter((a) => a.action && ["publish", "discardChanges", "restore"].includes(a.action)) : prev).map((a) =>
        a.action === "publish" ? withPublishSummary(a) : a.action === "discardChanges" ? withDiscardSummary(a) : a,
      ),
    // Top of every document: "Live on website" or "Changes not live yet".
    badges: (prev) => [LiveStatusBadge, ...prev],
    newDocumentOptions: (prev) => prev.filter((i) => !FIXED.has(i.templateId)),
  },
  // Opened from a page section in the sidebar, a document shows only that section's fields.
  // List items (slides, cards, banners...) get an eye to show / hide them on the website.
  // SectionInput also adds an image address box under every image field.
  form: { components: { input: SectionInput, item: VisibilityItem } },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  // "Discard" in the document footer, right before Publish (Sanity's footer slot; it replaces the Tasks button there).
  __internal_tasks: { footerAction: createElement(FooterDiscard) },
};

const live = activeDataset === "production";

/**
 * One admin per website, always at /admin, editing that website's own dataset:
 *   gadiride.com (main)          -> production
 *   dev.gadiride.com (dev), local -> development
 */
export default defineConfig({
  ...shared,
  name: activeDataset,
  title: live ? "Gadiride · Production" : "Gadiride · Development",
  subtitle: live ? "production dataset: changes go to gadiride.com" : "development dataset: safe to experiment",
  basePath: "/admin",
  dataset: activeDataset,
  studio: { components: { navbar: makeNavbar(live ? "Production · changes go to gadiride.com" : "Development · safe to experiment", live) } },
});

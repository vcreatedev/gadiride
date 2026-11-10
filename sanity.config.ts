"use client";
import { createElement } from "react";
import { defineConfig, type WorkspaceOptions } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset as activeDataset, projectId, testOverlay } from "./src/sanity/env";
import { liveCopyTemplate, liveInitialValue } from "./src/sanity/testCopy";
import { LiveReferenceInput } from "./src/sanity/LiveReferenceInput";
import { schemaTypes, SINGLETONS } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { GadirideIcon, makeNavbar, StudioLayout, studioTheme } from "./src/sanity/theme";
import SectionInput from "./src/sanity/SectionInput";
import VisibilityItem from "./src/sanity/VisibilityItem";
import FooterDiscard from "./src/sanity/DraftBar";
import { LiveStatusBadge, withDiscardSummary, withPublishSummary } from "./src/sanity/publishChanges";
import { DEFAULT_LOCATION } from "./src/data/cities";

/** Types that may not be created or deleted from the Studio (fixed set). */
const FIXED = new Set([...Object.keys(SINGLETONS), "vehicleGroup"]);

const DOCUMENT_TYPES = schemaTypes.filter((t) => t.type === "document").map((t) => t.name);

type SchemaDef = { type?: string; fields?: SchemaDef[]; of?: SchemaDef[]; components?: Record<string, unknown> };
/**
 * Test copy: links to other documents (a vehicle's type, a trip's vehicle) are weak and pick from
 * the live content too, so an edited document never needs a copy of the one it points to.
 */
const forTestCopy = (t: SchemaDef): SchemaDef =>
  t.type === "reference"
    ? { ...t, weak: true, components: { ...t.components, input: LiveReferenceInput } } as SchemaDef
    : { ...t, ...(t.fields ? { fields: t.fields.map(forTestCopy) } : {}), ...(t.of ? { of: t.of.map(forTestCopy) } : {}) };
const studioTypes = testOverlay ? (schemaTypes as unknown as SchemaDef[]).map(forTestCopy) as unknown as typeof schemaTypes : schemaTypes;

/**
 * Test copy (dev admin) only: a document not stored here yet opens filled with its live content;
 * it is stored on the first edit (see src/sanity/testCopy.ts). Hidden from the "Create" menu.
 */
const liveCopyTemplates = testOverlay
  ? DOCUMENT_TYPES.map((type) => ({
      id: liveCopyTemplate(type),
      title: "Live content",
      schemaType: type,
      parameters: [{ name: "id", type: "string" }],
      value: (p: { id?: string }, ctx: { getClient: (o: { apiVersion: string }) => Parameters<typeof liveInitialValue>[0] }) =>
        liveInitialValue(ctx.getClient({ apiVersion }), p.id),
    }))
  : [];

const shared: Omit<WorkspaceOptions, "name" | "title" | "basePath" | "dataset"> = {
  projectId: projectId || "missing",
  theme: studioTheme,
  icon: GadirideIcon,
  schema: {
    types: studioTypes,
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
      ...liveCopyTemplates,
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
    newDocumentOptions: (prev) => prev.filter((i) => !FIXED.has(i.templateId) && !i.templateId.startsWith("live-copy-")),
  },
  // Opened from a page section in the sidebar, a document shows only that section's fields.
  // List items (slides, cards, banners...) get an eye to show / hide them on the website.
  // SectionInput also adds an image address box under every image field.
  form: { components: { input: SectionInput, item: VisibilityItem } },
  plugins: [
    structureTool({
      structure,
      // Test copy: any document opened from a link or search also starts from its live content.
      ...(testOverlay
        ? { defaultDocumentNode: (S, { schemaType, documentId }) => (documentId ? S.document().initialValueTemplate(liveCopyTemplate(schemaType), { id: documentId }) : S.document()) }
        : {}),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  // "Discard" in the document footer, right before Publish (Sanity's footer slot; it replaces the Tasks button there).
  __internal_tasks: { footerAction: createElement(FooterDiscard) },
};

const live = activeDataset === "production";

/**
 * One admin per website, always at /admin:
 *   gadiride.com (main)          -> edits production (live)
 *   dev.gadiride.com (dev), local -> test copy: shows production, stores only the edits made here
 *                                    in development; they are removed after an hour
 *                                    (.github/workflows/sync-dev-data.yml).
 */
export default defineConfig({
  ...shared,
  name: activeDataset,
  title: live ? "Gadiride · Production" : "Gadiride · Test copy",
  subtitle: live ? "production dataset: changes go to gadiride.com" : "live content + your test edits (removed after 1 hour)",
  basePath: "/admin",
  dataset: activeDataset,
  studio: {
    components: {
      layout: StudioLayout,
      navbar: makeNavbar(live ? "Production · changes go to gadiride.com" : "Test copy · live content, your edits removed after 1 hour", live),
    },
  },
});

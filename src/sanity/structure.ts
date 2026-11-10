import type { StructureBuilder, StructureResolver } from "sanity/structure";
import {
  AddCircleIcon, CalendarIcon, DashboardIcon,
  CaseIcon, CogIcon, DocumentIcon, EarthGlobeIcon, EnvelopeIcon, HelpCircleIcon, HomeIcon, InfoOutlineIcon,
  LinkIcon, MenuIcon, PackageIcon, SearchIcon, TagIcon, ThListIcon, UserIcon, WarningOutlineIcon, WrenchIcon,
} from "@sanity/icons";
import type { ComponentType } from "react";
import { GROUPS } from "@/data/vehicles";
import { FOOTER, HEADER, PAGES, SETTINGS, type ItemList, type PageMap, type SectionItem } from "./pageMap";
import SectionsPane from "./SectionsPane";
import QuickAddPane from "./QuickAddPane";
import OverviewPane from "./OverviewPane";
import { testOverlay } from "./env";
import { liveCopyTemplate } from "./testCopy";

/**
 * The admin sidebar mirrors the website: one entry per page, in the header's order. Each page
 * opens as its sections from top to bottom (see pageMap.ts); a section opens the document that
 * holds it, scrolled to that section. Site settings stays a separate entry at the bottom.
 */
const BY_ORDER = [{ field: "order", direction: "asc" as const }, { field: "_createdAt", direction: "asc" as const }];

const ICONS: Record<string, ComponentType> = {
  home: HomeIcon, "all-vehicles": ThListIcon, vehicle: DocumentIcon, drivers: UserIcon, services: WrenchIcon,
  corporate: CaseIcon, partner: LinkIcon, careers: CaseIcon, about: InfoOutlineIcon, faq: HelpCircleIcon,
  contact: EnvelopeIcon, search: SearchIcon, "404": WarningOutlineIcon, header: MenuIcon, footer: MenuIcon, settings: EarthGlobeIcon,
};

/** A document pane. In the test copy (dev admin) it starts from the live content until edited. */
const docNode = (S: StructureBuilder, type: string, id: string) => {
  const node = S.document().schemaType(type).documentId(id);
  return testOverlay ? node.initialValueTemplate(liveCopyTemplate(type), { id }) : node;
};

/** What opens when a section is clicked. */
function open(S: StructureBuilder, item: SectionItem) {
  const t = item.target;
  if (t.kind === "doc") {
    const id = t.id ?? t.type;
    return docNode(S, t.type, id).title(item.title);
  }
  // Test copy: Sanity's own lists only see the test edits, so use the list that also shows live items.
  if (testOverlay) return quickPane(S, `list-${item.key}`, { title: item.title, type: t.type, filter: t.filter, params: t.params, template: t.template });
  const list = S.documentList()
    .id(`list-${item.key}`)
    .title(item.title)
    .schemaType(t.type)
    .filter(t.filter ?? `_type == "${t.type}"`)
    .params(t.params ?? {})
    .defaultOrdering(BY_ORDER);
  return t.template ? list.initialValueTemplates([S.initialValueTemplateItem(t.template.id, t.template.params)]) : list;
}

const pageItem = (S: StructureBuilder, page: PageMap) =>
  S.listItem()
    .id(`page-${page.id}`)
    .title(page.title)
    .icon(ICONS[page.id] ?? PackageIcon)
    .child(
      S.component(SectionsPane)
        .id(`sections-${page.id}`)
        .title(page.title)
        .options({ page })
        .child((key: string) => {
          const item = page.sections.find((s) => s.key === key);
          return item ? open(S, item) : undefined;
        }),
    );

const byId = (id: string) => PAGES.find((p) => p.id === id)!;
const groupIds = new Set<string>(GROUPS.map((g) => g.id));

/** A quick-add pane: the list with Add, reorder, show / hide and delete; rows open to the right. */
const quickPane = (S: StructureBuilder, id: string, list: ItemList) =>
  S.component(QuickAddPane)
    .id(`add-list-${id}`)
    .title(list.title)
    .options({ list })
    .child((docId: string, ctx) => docNode(S, ctx.params?.type ?? list.type, docId));

/** Quick add: each service's vehicles (and drivers), with "Add" creating one in the right place. */
const quickAdd = (S: StructureBuilder) =>
  S.listItem()
    .id("add-vehicles")
    .title("Add vehicles")
    .icon(AddCircleIcon)
    .child(
      S.list()
        .title("Add vehicles")
        .items([
          ...GROUPS.map((g) =>
            S.listItem()
              .id(`add-${g.id}`)
              .title(g.short)
              .icon(PackageIcon)
              .child(quickPane(S, g.id, {
                title: g.name,
                type: "vehicle",
                filter: "group == $group",
                params: { group: g.id },
                template: { id: "vehicle-by-group", params: { group: g.id } },
              })),
          ),
          S.listItem()
            .id("add-trips")
            .title("Today trips (shared seats)")
            .icon(CalendarIcon)
            .child(quickPane(S, "trips", { title: "Today trips: latest date first", type: "trip", sort: "date desc, time desc" })),
          S.listItem()
            .id("add-drivers")
            .title("Drivers")
            .icon(UserIcon)
            .child(quickPane(S, "drivers", { title: "Drivers", type: "driver" })),
        ]),
    );

/** Overview: every vehicle with its photo, status and place (cities and their areas). */
const overview = (S: StructureBuilder) =>
  S.listItem()
    .id("overview")
    .title("Overview")
    .icon(DashboardIcon)
    .child(
      S.component(OverviewPane)
        .id("vehicle-overview")
        .title("Vehicle overview")
        .child((docId: string) => docNode(S, "vehicle", docId)),
    );

/** A vehicle group's document (fixed ids). */
const groupItem = (S: StructureBuilder, id: string, name: string) =>
  testOverlay
    ? S.listItem().id(`group-${id}`).title(name).icon(PackageIcon).child(docNode(S, "vehicleGroup", `group-${id}`))
    : S.documentListItem().id(`group-${id}`).schemaType("vehicleGroup").title(name);

/** Every document of a type (in the test copy: live ones too). */
const typeListItem = (S: StructureBuilder, type: string, title: string, icon: ComponentType) =>
  testOverlay
    ? S.listItem().id(`all-${type}`).title(title).icon(icon).child(quickPane(S, `all-${type}`, { title, type }))
    : S.documentTypeListItem(type).title(title).icon(icon);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website")
    .items([
      overview(S),
      quickAdd(S),
      S.divider(),
      pageItem(S, HEADER),
      S.divider(),
      pageItem(S, byId("home")),
      S.divider(),
      ...PAGES.filter((p) => groupIds.has(p.id)).map((p) => pageItem(S, p)),
      ...["all-vehicles", "vehicle", "drivers"].map((id) => pageItem(S, byId(id))),
      S.divider(),
      ...["services", "corporate", "partner", "careers", "about", "faq", "contact", "search", "404"].map((id) => pageItem(S, byId(id))),
      S.divider(),
      pageItem(S, FOOTER),
      S.divider(),
      pageItem(S, SETTINGS),
      S.listItem()
        .id("catalog")
        .title("Catalog setup")
        .icon(CogIcon)
        .child(
          S.list()
            .title("Catalog setup")
            .items([
              S.listItem()
                .id("vehicle-groups")
                .title("Vehicle groups")
                .icon(PackageIcon)
                .child(S.list().title("Vehicle groups").items(GROUPS.map((g) => groupItem(S, g.id, g.name)))),
              typeListItem(S, "vehicleType", "All vehicle types", TagIcon),
              typeListItem(S, "vehicle", "All vehicles", ThListIcon),
            ]),
        ),
    ]);

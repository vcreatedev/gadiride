import type { StructureBuilder, StructureResolver } from "sanity/structure";
import {
  CaseIcon, CogIcon, DocumentIcon, EarthGlobeIcon, EnvelopeIcon, HelpCircleIcon, HomeIcon, InfoOutlineIcon,
  LinkIcon, MenuIcon, PackageIcon, SearchIcon, TagIcon, ThListIcon, UserIcon, WarningOutlineIcon, WrenchIcon,
} from "@sanity/icons";
import type { ComponentType } from "react";
import { GROUPS } from "@/data/vehicles";
import { FOOTER, HEADER, PAGES, SETTINGS, type PageMap, type SectionItem } from "./pageMap";
import SectionsPane from "./SectionsPane";

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

/** What opens when a section is clicked. */
function open(S: StructureBuilder, item: SectionItem) {
  const t = item.target;
  if (t.kind === "doc") {
    const id = t.id ?? t.type;
    return S.document().schemaType(t.type).documentId(id).title(item.title);
  }
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

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website")
    .items([
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
                .child(S.list().title("Vehicle groups").items(GROUPS.map((g) => S.documentListItem().id(`group-${g.id}`).schemaType("vehicleGroup").title(g.name)))),
              S.documentTypeListItem("vehicleType").title("All vehicle types").icon(TagIcon),
              S.documentTypeListItem("vehicle").title("All vehicles").icon(ThListIcon),
            ]),
        ),
    ]);

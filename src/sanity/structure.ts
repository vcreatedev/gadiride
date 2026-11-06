import type { StructureResolver } from "sanity/structure";
import { GROUPS } from "@/data/vehicles";
import { SINGLETONS } from "./schemaTypes";

const singleton = (S: Parameters<StructureResolver>[0], type: string) =>
  S.listItem().id(type).title(SINGLETONS[type]).child(S.document().schemaType(type).documentId(type).title(SINGLETONS[type]));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Gadiride admin")
    .items([
      S.listItem()
        .id("vehicles")
        .title("Vehicles")
        .child(
          S.list()
            .title("Vehicles")
            .items([
              S.listItem().id("all-vehicles").title("All vehicles").child(S.documentTypeList("vehicle").title("All vehicles")),
              S.divider(),
              ...GROUPS.map((g) =>
                S.listItem()
                  .id(`vehicles-${g.id}`)
                  .title(g.name)
                  .child(
                    S.documentList()
                      .id(`list-${g.id}`)
                      .title(g.name)
                      .schemaType("vehicle")
                      .filter('_type == "vehicle" && group == $group')
                      .params({ group: g.id })
                      .initialValueTemplates([S.initialValueTemplateItem("vehicle-by-group", { group: g.id })]),
                  ),
              ),
            ]),
        ),
      S.listItem()
        .id("catalog")
        .title("Catalog")
        .child(
          S.list()
            .title("Catalog")
            .items([
              S.documentTypeListItem("vehicleType").title("Vehicle types"),
              S.listItem()
                .id("vehicle-groups")
                .title("Vehicle groups")
                .child(
                  S.list()
                    .title("Vehicle groups")
                    .items(GROUPS.map((g) => S.documentListItem().id(`group-${g.id}`).schemaType("vehicleGroup").title(g.name))),
                ),
              S.documentTypeListItem("service").title("Services"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .id("pages")
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items(
              ["homePage", "vehiclesPage", "searchPage", "driversPage", "servicesPage", "partnerPage", "corporatePage", "careersPage", "aboutPage", "contactPage", "faqPage", "notFoundPage"].map((t) =>
                singleton(S, t),
              ),
            ),
        ),
      S.documentTypeListItem("driver").title("Drivers"),
      S.documentTypeListItem("faq").title("FAQs"),
      S.documentTypeListItem("testimonial").title("Customer reviews"),
      S.documentTypeListItem("careerRole").title("Career roles"),
      S.divider(),
      singleton(S, "siteSettings"),
    ]);

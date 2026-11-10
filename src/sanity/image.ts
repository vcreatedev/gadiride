import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId: projectId || "missing", dataset });

/**
 * A photo's URL. `fromDataset`: where the photo is stored, when not this site's dataset (in test
 * copy mode the pages mix live photos with ones added in the dev admin).
 */
export const urlFor = (source: SanityImageSource, fromDataset: string = dataset) =>
  (fromDataset === dataset ? builder : createImageUrlBuilder({ projectId: projectId || "missing", dataset: fromDataset }))
    .image(source)
    .auto("format")
    .fit("max");

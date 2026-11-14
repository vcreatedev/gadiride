"use client";
import { useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import { LinkIcon, UploadIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { insert, setIfMissing, useClient, type ArrayOfObjectsInputProps, type SchemaType } from "sanity";
import { apiVersion } from "./env";
import { downloadImage, isImageType } from "./ImageAddressInput";

/** The image item type of a list of photos (e.g. "More photos"), if it is one. */
export function imageItemType(t: SchemaType): SchemaType | undefined {
  if (t.jsonType !== "array") return undefined;
  return (t as SchemaType & { of?: SchemaType[] }).of?.find(isImageType);
}

/** Links in pasted text: one per line, or several separated by spaces or commas. */
const linksIn = (text: string) => text.split(/[\s,]+/).map((x) => x.trim()).filter((x) => /^(https?:|data:image\/|blob:)/i.test(x));

const newKey = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

/**
 * Every list of photos: the usual list, plus "Upload photos" (pick several files at once) and a box
 * that adds photos from image links (one or several at once, press Enter) or a copied image (Ctrl+V).
 */
export default function ImageListAddressInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion });
  const itemType = imageItemType(props.schemaType);
  const filePicker = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Uploads each picture and adds it to the end of the list, one by one, so earlier ones stay if a later one fails.
  const addAll = async (sources: (string | File)[]) => {
    if (!itemType || !sources.length || busy) return;
    const failed: string[] = [];
    for (const [i, src] of sources.entries()) {
      setBusy(sources.length > 1 ? `Adding ${i + 1} of ${sources.length}…` : "Adding…");
      try {
        const file = typeof src === "string" ? await downloadImage(src) : src;
        const link = typeof src === "string" && src.startsWith("http") ? src : undefined;
        const asset = await client.assets.upload("image", file, { filename: file.name, ...(link ? { source: { name: "image-address", id: link, url: link } } : {}) });
        const item = { _type: itemType.name, _key: newKey(), asset: { _type: "reference", _ref: asset._id } };
        props.onChange([setIfMissing([]), insert([item], "after", [-1])]);
      } catch (err) {
        const what = typeof src === "string" ? (src.length > 60 ? `${src.slice(0, 57)}…` : src) : "Pasted image";
        failed.push(`${what}: ${(err as Error).message || "upload failed"}`);
      }
    }
    setErrors(failed);
    if (!failed.length) setAddress("");
    setBusy(null);
  };

  const fromBox = () => {
    const links = linksIn(address);
    if (!links.length) return setErrors(["Paste an image link that starts with https://"]);
    void addAll(links);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    fromBox();
  };

  // Photos picked from the computer or phone: several at once, added in the order picked.
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files ?? []);
    e.currentTarget.value = ""; // picking the same files again still works
    const photos = files.filter((f) => f.type.startsWith("image/"));
    const skipped = files.filter((f) => !f.type.startsWith("image/")).map((f) => `${f.name}: not a photo, skipped`);
    if (!photos.length) return setErrors(skipped);
    void addAll(photos).then(() => skipped.length && setErrors((prev) => [...skipped, ...prev]));
  };

  // Copied images (e.g. "Copy image" in Chrome) pasted straight into the box.
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    e.preventDefault();
    void addAll(files);
  };

  const count = Array.isArray(props.value) ? props.value.length : 0;
  const mainFirst = props.path[props.path.length - 1] === "gallery"; // a vehicle's Photos: the first one is the main photo
  const summary = `${count} ${count === 1 ? "photo" : "photos"}${mainFirst ? (count ? " · the first one is the main photo" : " · none yet, so the website shows the vehicle type's photo") : ""}`;

  return (
    <Stack space={2}>
      <Text size={1} weight="semibold">{summary}</Text>
      {props.renderDefault(props)}
      {!props.readOnly && itemType && (
        <>
          <input ref={filePicker} type="file" accept="image/*" multiple hidden onChange={onPick} />
          <Button
            icon={UploadIcon}
            mode="ghost"
            fontSize={1}
            padding={3}
            text={busy ?? "Upload photos (you can pick several at once)"}
            loading={!!busy}
            disabled={!!busy}
            onClick={() => filePicker.current?.click()}
          />
        </>
      )}
      {!props.readOnly && itemType && (
        <Flex gap={2} align="center">
          <Box flex={1}>
            <TextInput
              icon={LinkIcon}
              fontSize={1}
              disabled={!!busy}
              placeholder="Add photos from links: paste one or more image links and press Enter (or Ctrl+V copied images)"
              value={address}
              onPaste={onPaste}
              onKeyDown={onKeyDown}
              onChange={(e) => { setAddress(e.currentTarget.value); setErrors([]); }}
            />
          </Box>
          <Button mode="ghost" onClick={fromBox} fontSize={1} text={busy ?? "Add"} loading={!!busy} disabled={!!busy || !address.trim()} />
        </Flex>
      )}
      {errors.length > 0 && (
        <Card padding={3} radius={2} tone="critical">
          <Stack space={2}>
            {errors.map((e, i) => <Text key={i} size={1}>{e}</Text>)}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

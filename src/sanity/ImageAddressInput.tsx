"use client";
import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { LinkIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { MemberField, set, setIfMissing, useClient, type ObjectInputProps, type ObjectMember, type SchemaType } from "sanity";
import { apiVersion } from "./env";

/** The site route that downloads the image (browsers cannot read most other sites directly). */
const FETCH_ROUTE = "/api/image-from-url/";

/** The image's own parts (the picture, crop, hotspot); everything else, like Alt text, is an extra field. */
const IMAGE_PARTS = new Set(["asset", "hotspot", "crop", "media"]);
const isExtraField = (m: ObjectMember) => m.kind === "field" && !IMAGE_PARTS.has(m.name);

/** True for image fields, including ones built on a named image type. */
export function isImageType(t: SchemaType | undefined): boolean {
  for (let s = t; s; s = s.type) if (s.name === "image") return true;
  return false;
}

function fileNameOf(address: string, type: string): string {
  const ext = type.split("/")[1]?.replace("jpeg", "jpg").replace("svg+xml", "svg") || "jpg";
  let last = "";
  try {
    last = decodeURIComponent(new URL(address).pathname.split("/").pop() || "");
  } catch {
    /* not a normal address (e.g. a data: link): use the default name */
  }
  const base = last.replace(/\.[a-z0-9]+$/i, "").replace(/[^\w.-]+/g, "-") || "image";
  return `${base.slice(0, 80)}.${ext}`;
}

/** Reads the image behind a pasted address: data: links locally, web links through the site route. */
async function downloadImage(address: string): Promise<File> {
  if (address.startsWith("blob:")) {
    throw new Error("That is a temporary link that only works inside the other website's tab. Right-click the image there, choose “Copy image”, then click this box and press Ctrl+V.");
  }
  if (address.startsWith("data:image/")) {
    const blob = await (await fetch(address)).blob();
    return new File([blob], fileNameOf("", blob.type), { type: blob.type });
  }
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    throw new Error("That is not a web address. It should start with https://");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("The address should start with https://");
  const res = await fetch(`${FETCH_ROUTE}?url=${encodeURIComponent(address)}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message || "Could not download that image.");
  }
  const blob = await res.blob();
  return new File([blob], fileNameOf(address, blob.type), { type: blob.type });
}

/**
 * Every image field: the usual drop zone / Upload / Select, plus a box right under it that takes an
 * image address (press Enter) or a copied image (Ctrl+V).
 */
export default function ImageAddressInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion });
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, source?: string) => {
    setBusy(true);
    setError(null);
    try {
      const asset = await client.assets.upload("image", file, {
        filename: file.name,
        ...(source ? { source: { name: "image-address", id: source, url: source } } : {}),
      });
      props.onChange([setIfMissing({ _type: props.schemaType.name }), set({ _type: "reference", _ref: asset._id }, ["asset"])]);
      setAddress("");
    } catch (err) {
      setError((err as Error).message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const fromAddress = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const file = await downloadImage(trimmed);
      await uploadFile(file, trimmed.startsWith("http") ? trimmed : undefined);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    void fromAddress(address);
  };

  // A copied image (e.g. "Copy image" in ChatGPT or Chrome) pasted straight into the box.
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      void uploadFile(file);
    }
  };

  // A link pasted into the drop zone ("Drag or paste image here"): Sanity only takes files there,
  // so catch text that looks like an image address first and add it.
  const onZonePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("input, textarea")) return;
    if (Array.from(e.clipboardData.files).length) return;
    const text = e.clipboardData.getData("text/plain").trim();
    if (!/^(https?:|data:image\/|blob:)/i.test(text)) return;
    e.preventDefault();
    e.stopPropagation();
    setAddress(text);
    void fromAddress(text);
  };

  return (
    <Stack space={2}>
      {/* The picture area first, then the address box, then Alt text and other extra fields. */}
      <div onPasteCapture={onZonePaste}>{props.renderDefault({ ...props, members: props.members.filter((m) => !isExtraField(m)) })}</div>
      {!props.readOnly && (
        <Box>
          <Flex gap={2} align="center">
            <Box flex={1}>
              <TextInput
                icon={LinkIcon}
                fontSize={1}
                disabled={busy}
                placeholder="Paste image link here and press Enter (or Ctrl+V a copied image)"
                value={address}
                onPaste={onPaste}
                onKeyDown={onKeyDown}
                onChange={(e) => { setAddress(e.currentTarget.value); setError(null); }}
              />
            </Box>
            <Button mode="ghost" onClick={() => void fromAddress(address)} fontSize={1} text={busy ? "Adding…" : "Add"} loading={busy} disabled={busy || !address.trim()} />
          </Flex>
        </Box>
      )}
      {error && (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>{error}</Text>
        </Card>
      )}
      {props.members.filter(isExtraField).map((m) =>
        m.kind === "field" ? (
          <MemberField
            key={m.key}
            member={m}
            renderField={props.renderField}
            renderInput={props.renderInput}
            renderItem={props.renderItem}
            renderPreview={props.renderPreview}
            renderAnnotation={props.renderAnnotation}
            renderBlock={props.renderBlock}
            renderInlineBlock={props.renderInlineBlock}
          />
        ) : null,
      )}
    </Stack>
  );
}

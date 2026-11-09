"use client";
import { useState } from "react";
import { useDocumentOperation, useSchema, type ObjectSchemaType } from "sanity";
import { useDocumentPane } from "sanity/structure";
import { Box, Button, Dialog, Flex, Stack, Text, useToast } from "@sanity/ui";
import { ResetIcon } from "@sanity/icons";
import { describeChanges, sameValue } from "./publishChanges";

type Doc = Record<string, unknown>;

/** A document without its system fields, for comparing the draft with the live copy. */
const content = ({ _id: _i, _rev: _r, _updatedAt: _u, _createdAt: _c, ...rest }: Doc) => rest;

/**
 * "Discard changes" in the document footer, right before Publish (Sanity's footer slot for plugins).
 * Shown while there are unpublished changes; it first lists exactly what will be thrown away.
 */
export default function FooterDiscard() {
  const { documentId, documentType, editState } = useDocumentPane();
  const { discardChanges } = useDocumentOperation(documentId, documentType);
  const schemaType = useSchema().get(documentType) as ObjectSchemaType | undefined;
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const draft = editState?.draft as Doc | null | undefined;
  const published = editState?.published as Doc | null | undefined;
  // Only a published page or item can go back to its live version.
  const pending = !!draft && !!published && !sameValue(content(draft), content(published));
  if (!pending) return null;
  const lines = open ? describeChanges(schemaType, draft, published) : [];

  const discard = () => {
    discardChanges.execute();
    setOpen(false);
    toast.push({ status: "success", title: "Changes discarded", description: "Back to what the website shows." });
  };

  return (
    <>
      <Button mode="ghost" tone="critical" icon={ResetIcon} text="Discard" onClick={() => setOpen(true)} />
      {open && (
        <Dialog
          id={`discard-${documentId}`}
          header="Discard these changes?"
          width={1}
          onClose={() => setOpen(false)}
          footer={
            <Flex gap={2} padding={3} justify="flex-end">
              <Button mode="ghost" text="Keep changes" onClick={() => setOpen(false)} />
              <Button tone="critical" icon={ResetIcon} text="Discard changes" disabled={!!discardChanges.disabled} onClick={discard} />
            </Flex>
          }
        >
          <Box padding={4}>
            <Stack space={3}>
              <Text size={1} weight="semibold">These unpublished changes will be thrown away. The website keeps what it shows now:</Text>
              {lines.map((l, i) => <Text key={i} size={1} muted>• {l}</Text>)}
            </Stack>
          </Box>
        </Dialog>
      )}
    </>
  );
}

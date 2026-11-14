"use client";
/**
 * A vehicle's "Vehicle type": the usual picker (types in the vehicle's group), plus
 * "New vehicle type" to add a missing one right here. The new type is selected straight away,
 * stays off the website until this vehicle is published (see newTypes.ts), and its photo can be
 * added later under Catalog → Vehicle types.
 */
import { useState, type KeyboardEvent } from "react";
import { getPublishedId, set, useClient, useFormValue, type ObjectInputProps } from "sanity";
import { Box, Button, Card, Flex, Stack, Text, TextInput, useToast } from "@sanity/ui";
import { AddIcon } from "@sanity/icons";
import { GROUPS, type GroupId } from "@/data/vehicles";
import { apiVersion, testOverlay } from "./env";
import { LiveReferenceInput } from "./LiveReferenceInput";
import { createVehicleType, type AddedType } from "./newTypes";

const NAME_MAX = 40;

type FormProps = { group?: GroupId; vehicleId: string; onAdded: (t: AddedType) => void; onClose: () => void };

function NewTypeForm({ group, vehicleId, onAdded, onClose }: FormProps) {
  const client = useClient({ apiVersion });
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const groupName = GROUPS.find((g) => g.id === group)?.name;

  const add = async () => {
    const clean = name.trim().replace(/\s+/g, " ");
    if (!group) return setError("Pick the vehicle group above first.");
    if (clean.length < 2) return setError("Type a name for the new type, e.g. Mini truck.");
    setBusy(true);
    setError(null);
    try {
      onAdded(await createVehicleType(client, clean, group, vehicleId));
    } catch (err) {
      setError(`Could not add it: ${(err as Error).message || "please try again."}`);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void add();
    } else if (e.key === "Escape") onClose();
  };

  return (
    <Card padding={3} radius={2} border tone="transparent">
      <Stack space={3}>
        <Text size={1} weight="semibold">{groupName ? `New vehicle type in ${groupName}` : "New vehicle type"}</Text>
        <Flex gap={2} wrap="wrap">
          <Box flex={1} style={{ minWidth: 180 }}>
            <TextInput
              autoFocus
              fontSize={1}
              value={name}
              maxLength={NAME_MAX}
              disabled={busy}
              placeholder="Name, e.g. Mini truck"
              onKeyDown={onKeyDown}
              onChange={(e) => { setName(e.currentTarget.value); setError(null); }}
            />
          </Box>
          <Button text="Add type" tone="primary" fontSize={1} padding={3} loading={busy} disabled={!name.trim()} onClick={() => void add()} />
          <Button text="Cancel" mode="bleed" fontSize={1} padding={3} disabled={busy} onClick={onClose} />
        </Flex>
        <Text size={1} muted>It is selected for this vehicle and goes live when you publish the vehicle. Add its photo later under Catalog → Vehicle types (until then the website uses a standard picture).</Text>
        {error && (
          <Card padding={2} radius={2} tone="critical">
            <Text size={1}>{error}</Text>
          </Card>
        )}
      </Stack>
    </Card>
  );
}

export default function VehicleTypeInput(props: ObjectInputProps) {
  const group = useFormValue(["group"]) as GroupId | undefined;
  const vehicleId = getPublishedId(String(useFormValue(["_id"]) ?? ""));
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  // Remounts the test-copy picker after adding, so its list includes the new type.
  const [listVersion, setListVersion] = useState(0);

  const onAdded = (t: AddedType) => {
    // Test copy: links are weak there (see forTestCopy in sanity.config.ts).
    props.onChange(set({ _type: "reference", _ref: t.id, ...(testOverlay ? { _weak: true } : {}) }));
    setListVersion((v) => v + 1);
    setAdding(false);
    toast.push(
      t.existed
        ? { status: "info", title: `"${t.name}" already exists`, description: "It is selected for this vehicle." }
        : { status: "success", title: `"${t.name}" added`, description: "Selected for this vehicle. It goes live when you publish the vehicle." },
    );
  };

  return (
    <Stack space={3}>
      {testOverlay ? <LiveReferenceInput key={listVersion} {...props} /> : props.renderDefault(props)}
      {!props.readOnly &&
        (adding ? (
          <NewTypeForm group={group} vehicleId={vehicleId} onAdded={onAdded} onClose={() => setAdding(false)} />
        ) : (
          <Box>
            <Button mode="ghost" icon={AddIcon} text="New vehicle type" fontSize={1} padding={2} onClick={() => setAdding(true)} />
          </Box>
        ))}
    </Stack>
  );
}

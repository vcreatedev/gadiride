"use client";
import { useEffect, useState } from "react";
import { useClient, useFormValue, type ObjectInputProps } from "sanity";
import { Box, Card, Flex, Stack, Text } from "@sanity/ui";
import { apiVersion } from "./env";
import { stockPhotoUrl } from "./stockPhoto";

type Fallback = { url: string; label: string };
type TypeDoc = { url?: string; key?: string; group?: string } | null;

/** Vehicle: its type's photo in Sanity, else the built-in photo for that type. */
function useVehicleFallback(): Fallback | undefined {
  const client = useClient({ apiVersion });
  const typeRef = (useFormValue(["type"]) as { _ref?: string } | undefined)?._ref;
  const group = useFormValue(["group"]) as string | undefined;
  const [type, setType] = useState<TypeDoc>(null);
  useEffect(() => {
    if (!typeRef) return setType(null);
    let alive = true;
    client
      .fetch<TypeDoc>(`*[_id in [$id, "drafts." + $id]] | order(_updatedAt desc)[0]{"url": image.asset->url, "key": key.current, group}`, { id: typeRef })
      .then((t) => alive && setType(t), () => alive && setType(null));
    return () => { alive = false; };
  }, [client, typeRef]);
  if (type?.url) return { url: `${type.url}?w=640&fit=max&auto=format`, label: "the vehicle type's photo" };
  const stock = stockPhotoUrl(type?.key, type?.group ?? group);
  return stock ? { url: stock, label: "the default photo for this type" } : undefined;
}

/** Vehicle type: the built-in photo for its ID (or its group). */
function useTypeFallback(): Fallback | undefined {
  const key = (useFormValue(["key"]) as { current?: string } | undefined)?.current;
  const group = useFormValue(["group"]) as string | undefined;
  const stock = stockPhotoUrl(key, group);
  return stock ? { url: stock, label: "the default photo for this type" } : undefined;
}

function WithFallback({ props, fallback }: { props: ObjectInputProps; fallback?: Fallback }) {
  const hasOwn = Boolean((props.value as { asset?: unknown } | undefined)?.asset);
  if (hasOwn || !fallback) return props.renderDefault(props);
  return (
    <Stack space={3}>
      <Card border radius={2} padding={2} tone="transparent">
        <Flex gap={3} align="center">
          <Box style={{ width: 160, flexShrink: 0 }}>
            <img src={fallback.url} alt="" style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 4, display: "block" }} />
          </Box>
          <Stack space={2}>
            <Text size={1} weight="medium">Shown on the website now</Text>
            <Text size={1} muted>No photo uploaded, so the website uses {fallback.label}. Upload one below to replace it.</Text>
          </Stack>
        </Flex>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  );
}

/** A vehicle's "Main photo": when empty, shows the photo the website uses instead. */
export function VehiclePhotoInput(props: ObjectInputProps) {
  return <WithFallback props={props} fallback={useVehicleFallback()} />;
}

/** A vehicle type's "Photo": when empty, shows the built-in photo the website uses. */
export function TypePhotoInput(props: ObjectInputProps) {
  return <WithFallback props={props} fallback={useTypeFallback()} />;
}

"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getPublishedId, set, unset, useDocumentOperation, useFormValue, type StringInputProps } from "sanity";
import { Box, Button, Card, Flex, Spinner, Stack, Text, TextInput, useToast } from "@sanity/ui";
import { PinIcon, TargetIcon } from "@sanity/icons";
import { currentPlace, searchPlaces, type Place } from "@/lib/places";
import { cityOption } from "@/lib/serviceArea";

const SEARCH_DELAY_MS = 250;
const CLOSE_DELAY_MS = 150;
const PIN = /^[1-9]\d{5}$/;

/** Live suggestions (places, or a pincode's areas) for the typed text, debounced; older requests are cancelled. */
function useSuggestions(query: string) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    const q = query.trim();
    setFailed(null);
    if (q.length < 2) {
      setPlaces([]);
      setLoading(false);
      return;
    }
    const ctl = new AbortController();
    setLoading(true);
    const t = window.setTimeout(() => {
      searchPlaces(q, { signal: ctl.signal })
        .then((ps) => setPlaces(ps))
        .catch((e: Error) => {
          if (e.name === "AbortError") return;
          setPlaces([]);
          setFailed(e.message || "Place search failed.");
        })
        .finally(() => !ctl.signal.aborted && setLoading(false));
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [query]);
  return { places, loading, failed };
}

/**
 * The vehicle's Area, like the website's location box: suggestions as you type (a pincode lists its
 * areas) and "Use my location". Picking one also fills Location (when it is one of our cities) and Pincode.
 */
export default function AreaInput(props: StringInputProps) {
  const { value, onChange, elementProps, readOnly } = props;
  const id = useFormValue(["_id"]) as string | undefined;
  const type = useFormValue(["_type"]) as string | undefined;
  const { patch } = useDocumentOperation(getPublishedId(id ?? ""), type ?? "");
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [locating, setLocating] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const { places, loading, failed } = useSuggestions(open ? query : "");

  const apply = (p: Place) => {
    const area = (p.area ?? p.label).trim();
    onChange(area ? set(area) : unset());
    setOpen(false);
    setQuery("");
    const location = cityOption(p.city) ?? cityOption(p.detail);
    const pincode = p.pincode && PIN.test(p.pincode) ? p.pincode : undefined;
    const fill = { ...(location ? { location } : {}), ...(pincode ? { pincode } : {}) };
    if (Object.keys(fill).length) patch.execute([{ set: fill }]);
    const filled = [location && `Location: ${location}`, pincode && `Pincode: ${pincode}`].filter(Boolean).join(" · ");
    toast.push({ status: "success", title: `Area: ${area}`, description: filled || "This city is not in our Location list. Choose the nearest one above." });
  };

  const locate = async () => {
    setLocating(true);
    try {
      apply(await currentPlace());
    } catch (e) {
      toast.push({ status: "error", title: "Could not use your location", description: (e as Error).message });
    } finally {
      setLocating(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || !places.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + places.length) % places.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      apply(places[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length >= 2;
  return (
    <Stack space={2}>
      <Flex gap={2} align="center">
        <Box flex={1}>
          <TextInput
            {...elementProps}
            value={value ?? ""}
            readOnly={readOnly}
            icon={PinIcon}
            autoComplete="off"
            onChange={(e) => {
              const text = e.currentTarget.value;
              onChange(text.trim() ? set(text) : unset());
              setQuery(text);
              setActive(0);
              setOpen(true);
            }}
            onFocus={(e) => {
              window.clearTimeout(closeTimer.current);
              elementProps.onFocus(e);
            }}
            onBlur={(e) => {
              elementProps.onBlur(e);
              closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
            }}
            onKeyDown={onKeyDown}
          />
        </Box>
        <Button mode="ghost" icon={TargetIcon} text={locating ? "Finding…" : "Use my location"} loading={locating} disabled={readOnly} onClick={locate} fontSize={1} padding={3} />
      </Flex>
      {showList && (
        // onMouseDown keeps the field focused, so a click picks the place before the list closes.
        <Card border radius={2} shadow={1} onMouseDown={(e) => e.preventDefault()}>
          {loading && (
            <Flex align="center" gap={2} padding={3}>
              <Spinner muted />
              <Text size={1} muted>Searching places…</Text>
            </Flex>
          )}
          {!loading && failed && <Box padding={3}><Text size={1} muted>{failed}</Text></Box>}
          {!loading && !failed && !places.length && <Box padding={3}><Text size={1} muted>No matches. You can keep what you typed.</Text></Box>}
          {!loading && places.length > 0 && (
            <Stack>
              {places.map((p, i) => (
                <Card key={`${p.label}|${p.detail ?? ""}|${i}`} as="button" type="button" padding={3} tone={i === active ? "primary" : "default"} onMouseEnter={() => setActive(i)} onClick={() => apply(p)} style={{ textAlign: "left", width: "100%" }}>
                  <Flex align="center" gap={3}>
                    <Text size={1} muted><PinIcon /></Text>
                    <Stack space={2} flex={1}>
                      <Text size={1} weight="medium" textOverflow="ellipsis">{p.label}</Text>
                      {p.detail && <Text size={0} muted textOverflow="ellipsis">{p.detail}</Text>}
                    </Stack>
                  </Flex>
                </Card>
              ))}
            </Stack>
          )}
        </Card>
      )}
    </Stack>
  );
}

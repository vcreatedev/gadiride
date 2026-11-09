"use client";
import { useEffect, useState } from "react";
import { set, unset, useFormValue, type FieldProps, type StringInputProps } from "sanity";
import { Box, Button, Card, Flex, Select, Stack, Text, TextInput } from "@sanity/ui";
import { ClockIcon, CloseIcon } from "@sanity/icons";
import { spanText, whenText } from "@/lib/timer";

const DAY = 86_400_000;
const QUICK_DAYS = [7, 15, 30, 90];
const TICK_MS = 30_000;
const STEP_MIN = 15;
/** India time is UTC+5:30 all year (no daylight saving). */
const IST_OFFSET = 330 * 60_000;
const DEFAULT_TIME = "10:00";

/** The current time, refreshed every 30 seconds so countdowns keep moving. */
export function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** A stored moment as India date ("2026-11-12") and time ("10:00"). */
function toIst(iso: string | undefined): { date: string; time: string } {
  const ms = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(ms)) return { date: "", time: "" };
  const d = new Date(ms + IST_OFFSET);
  return { date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` };
}

/** An India date and time back to the stored moment (ISO, UTC). */
function fromIst(date: string, time: string): string | undefined {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return undefined;
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - IST_OFFSET).toISOString();
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1 … 12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 00 … 59

/** Hour, minute and AM/PM as three separate dropdowns; `time` and `onChange` use 24-hour "HH:MM". */
function TimePicker({ time, disabled, onChange }: { time: string; disabled: boolean; onChange: (time: string) => void }) {
  const [h24, minute] = time.split(":").map(Number);
  const pm = h24 >= 12;
  const hour12 = ((h24 + 11) % 12) + 1;
  // Back to 24-hour: 12 AM = 00, 12 PM = 12.
  const emit = (h: number, m: number, isPm: boolean) => onChange(`${pad((h % 12) + (isPm ? 12 : 0))}:${pad(m)}`);
  return (
    <Flex gap={1} align="center">
      <Select value={hour12} disabled={disabled} onChange={(e) => emit(Number(e.currentTarget.value), minute, pm)} aria-label="Hour" style={{ minWidth: 64 }}>
        {HOURS_12.map((h) => <option key={h} value={h}>{h}</option>)}
      </Select>
      <Text size={2} weight="semibold">:</Text>
      <Select value={minute} disabled={disabled} onChange={(e) => emit(hour12, Number(e.currentTarget.value), pm)} aria-label="Minute" style={{ minWidth: 64 }}>
        {MINUTES.map((m) => <option key={m} value={m}>{pad(m)}</option>)}
      </Select>
      <Select value={pm ? "PM" : "AM"} disabled={disabled} onChange={(e) => emit(hour12, minute, e.currentTarget.value === "PM")} aria-label="AM or PM" style={{ minWidth: 70 }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </Select>
    </Flex>
  );
}

/** Rounded up to the next 15 minutes, so quick choices land on a clean time. */
const roundUp = (ms: number) => Math.ceil(ms / (STEP_MIN * 60_000)) * STEP_MIN * 60_000;

function statusOf(value: string | undefined, isUntil: boolean, now: number) {
  const at = value ? Date.parse(value) : NaN;
  if (Number.isNaN(at)) return null;
  const when = whenText(value as string);
  if (isUntil) return at > now ? { tone: "primary" as const, text: `Hides from the website at ${when} (in ${spanText(at - now)})` } : { tone: "critical" as const, text: `Ended: hidden from the website since ${when}` };
  return at > now ? { tone: "caution" as const, text: `Goes live on the website at ${when} (in ${spanText(at - now)})` } : { tone: "positive" as const, text: `Live since ${when}` };
}

/**
 * "Go live at" and "Show until" on a vehicle, in India time: a date, a time from a list, a Clear button
 * (no timer = the vehicle stays on), a live countdown, and for "Show until" quick "show for N days" buttons.
 */
export default function TimerInput(props: StringInputProps) {
  const { value, onChange, readOnly, elementProps } = props;
  const now = useNow();
  const liveFrom = useFormValue(["liveFrom"]) as string | undefined;
  const isUntil = ["liveUntil", "expiresAt"].includes(String(props.path[props.path.length - 1]));
  const isTrip = useFormValue(["_type"]) === "trip";
  const thing = isTrip ? "trip" : "vehicle";
  const { date, time } = toIst(value);
  const status = statusOf(value, isUntil, now);

  const save = (nextDate: string, nextTime: string) => {
    const iso = nextDate ? fromIst(nextDate, nextTime || DEFAULT_TIME) : undefined;
    onChange(iso ? set(iso) : unset());
  };
  // Counted from "Go live at" when that is still ahead, else from now.
  const base = liveFrom && Date.parse(liveFrom) > now ? Date.parse(liveFrom) : roundUp(now);
  const showFor = (days: number) => onChange(set(new Date(base + days * DAY).toISOString()));

  return (
    <Stack space={2}>
      <Flex gap={2} align="center" wrap="wrap">
        <Box style={{ minWidth: 170 }}>
          <TextInput
            id={elementProps.id}
            ref={elementProps.ref}
            onFocus={elementProps.onFocus}
            onBlur={elementProps.onBlur}
            type="date"
            value={date}
            readOnly={readOnly}
            onChange={(e) => save(e.currentTarget.value, time)}
          />
        </Box>
        <TimePicker time={time || DEFAULT_TIME} disabled={readOnly || !date} onChange={(t) => save(date, t)} />
        <Text size={1} muted>India time</Text>
        {value && !readOnly && (
          <Button mode="ghost" tone="critical" icon={CloseIcon} text="Clear" fontSize={1} padding={3} onClick={() => onChange(unset())} />
        )}
      </Flex>
      {status ? (
        <Card padding={2} radius={2} tone={status.tone}>
          <Flex align="center" gap={2}>
            <Text size={1}><ClockIcon /></Text>
            <Text size={1} weight="medium">{status.text}</Text>
          </Flex>
        </Card>
      ) : (
        <Text size={1} muted>
          {isUntil
            ? isTrip ? "No end time set: the trip disappears from the website when it starts (its date and start time)." : "No end time: the vehicle stays on the website until you hide it."
            : `No start time: the ${thing} is live as soon as it is published.`}
        </Text>
      )}
      {isUntil && !readOnly && (
        <Flex align="center" gap={2} wrap="wrap">
          <Text size={1} muted>Show for:</Text>
          {QUICK_DAYS.map((d) => (
            <Button key={d} mode="ghost" fontSize={1} padding={2} text={`${d} days`} onClick={() => showFor(d)} />
          ))}
        </Flex>
      )}
    </Stack>
  );
}

/**
 * The field around a timer: its own clear heading ("Go live at (optional)", "Show until (optional)")
 * and explanation above the boxes, so they always show; Sanity's header is not drawn a second time.
 */
export function TimerField(props: FieldProps) {
  return (
    <Stack space={3}>
      <Stack space={2}>
        <Text as="label" htmlFor={props.inputId} size={1} weight="semibold">{props.title}</Text>
        {props.description && <Text size={1} muted>{props.description}</Text>}
      </Stack>
      {props.renderDefault({ ...props, title: undefined, description: undefined })}
    </Stack>
  );
}

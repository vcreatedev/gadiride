"use client";
import { set, unset, type StringInputProps } from "sanity";
import { Flex, Select, Text } from "@sanity/ui";

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1 … 12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 00 … 59
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A time of day saved as "HH:MM" (24-hour), picked as hour, minute and AM/PM, like the vehicle timers.
 * Starts blank until an hour is chosen (minute then defaults to 00).
 */
export default function ClockTimeInput(props: StringInputProps) {
  const { value, onChange, readOnly, elementProps } = props;
  const m = value?.match(TIME_RE);
  const h24 = m ? Number(m[1]) : null;
  const minute = m ? Number(m[2]) : null;
  const pm = h24 !== null && h24 >= 12;
  const hour12 = h24 === null ? null : ((h24 + 11) % 12) + 1;

  // Back to 24-hour: 12 AM = 00, 12 PM = 12.
  const emit = (h: number | null, min: number | null, isPm: boolean) =>
    onChange(h === null ? unset() : set(`${pad((h % 12) + (isPm ? 12 : 0))}:${pad(min ?? 0)}`));

  return (
    <Flex gap={1} align="center" wrap="wrap">
      <Select
        id={elementProps.id}
        onFocus={elementProps.onFocus}
        onBlur={elementProps.onBlur}
        value={hour12 ?? ""}
        disabled={readOnly}
        aria-label="Hour"
        style={{ minWidth: 72 }}
        onChange={(e) => emit(e.currentTarget.value ? Number(e.currentTarget.value) : null, minute, pm)}
      >
        <option value="">--</option>
        {HOURS_12.map((h) => <option key={h} value={h}>{h}</option>)}
      </Select>
      <Text size={2} weight="semibold">:</Text>
      <Select value={minute ?? ""} disabled={readOnly || hour12 === null} aria-label="Minute" style={{ minWidth: 72 }} onChange={(e) => emit(hour12, Number(e.currentTarget.value), pm)}>
        {minute === null && <option value="">--</option>}
        {MINUTES.map((x) => <option key={x} value={x}>{pad(x)}</option>)}
      </Select>
      <Select value={pm ? "PM" : "AM"} disabled={readOnly || hour12 === null} aria-label="AM or PM" style={{ minWidth: 76 }} onChange={(e) => emit(hour12, minute, e.currentTarget.value === "PM")}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </Select>
      <Text size={1} muted>India time</Text>
    </Flex>
  );
}

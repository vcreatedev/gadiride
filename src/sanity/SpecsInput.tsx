"use client";
/**
 * A vehicle's Specifications, edited in place: one row per spec with its label and value. Both are
 * typed, or picked from the ▾ list (usual labels for the vehicle's group, common values for that
 * label). "Add specification" offers the usual ones not used yet, or a label of your own. Drag a
 * row to change the order (the first three show on cards); the eye hides one on the website.
 *
 * The old separate Mileage box is no longer in the form: a vehicle that still has a value there gets
 * a one-click "Move into the list".
 */
import { useEffect, useRef, useState, type CSSProperties, type Ref } from "react";
import { getPublishedId, insert, set, setIfMissing, unset, useDocumentOperation, useFormValue, type ArrayOfObjectsInputProps } from "sanity";
import { Box, Button, Card, Flex, Menu, MenuButton, MenuDivider, MenuItem, Stack, Text, TextInput, Tooltip } from "@sanity/ui";
import { AddIcon, ChevronDownIcon, DragHandleIcon, EditIcon, EyeClosedIcon, EyeOpenIcon, TrashIcon } from "@sanity/icons";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { HIDDEN_FIELD } from "./schemaTypes/visibility";
import { defaultSpecLabels, presetFor, specPresets } from "./vehicleForm";

type Spec = { _key: string; _type?: string; label?: string; value?: string; hidden?: boolean };
type Field = "label" | "value";

const newKey = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);
const isMileage = (label?: string) => /mileage/i.test(label ?? "");
const tip = (text: string) => <Box padding={2}><Text size={1}>{text}</Text></Box>;
/** Label and value side by side, stacked when the form is narrow. */
const ROW_GRID: CSSProperties = { flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 };

type PickProps = {
  id: string;
  value?: string;
  placeholder: string;
  choices: string[];
  readOnly?: boolean;
  inputRef: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
};

/** A text box with a ▾ list beside it: pick a ready-made entry, or type anything. */
function PickOrType({ id, value, placeholder, choices, readOnly, inputRef, onChange }: PickProps) {
  return (
    <Flex gap={1} align="center">
      <Box flex={1} style={{ minWidth: 0 }}>
        <TextInput ref={inputRef} fontSize={1} value={value ?? ""} placeholder={placeholder} readOnly={readOnly} onChange={(e) => onChange(e.currentTarget.value)} />
      </Box>
      {choices.length > 0 && !readOnly && (
        <MenuButton
          id={id}
          button={<Button mode="ghost" icon={ChevronDownIcon} padding={2} aria-label="Pick from the list" title="Pick from the list" />}
          menu={
            <Menu>
              {choices.map((c) => <MenuItem key={c} text={c} pressed={c === value} onClick={() => onChange(c)} />)}
            </Menu>
          }
          popover={{ portal: true, placement: "bottom-end", constrainSize: true }}
        />
      )}
    </Flex>
  );
}

type RowProps = {
  spec: Spec;
  group: unknown;
  labels: string[];
  readOnly?: boolean;
  register: (key: string, field: Field) => Ref<HTMLInputElement>;
  onField: (key: string, field: Field, value: string) => void;
  onToggle: (spec: Spec) => void;
  onRemove: (key: string) => void;
};

function SpecRow({ spec, group, labels, readOnly, register, onField, onToggle, onRemove }: RowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: spec._key, disabled: readOnly });
  const preset = presetFor(spec.label, group);
  const hidden = spec.hidden === true;
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition, position: "relative", zIndex: isDragging ? 2 : undefined };
  return (
    <Card ref={setNodeRef} style={style} padding={2} radius={2} border shadow={isDragging ? 2 : undefined}>
      <Flex align="center" gap={1}>
        {!readOnly && (
          <Button
            ref={setActivatorNodeRef}
            mode="bleed"
            icon={DragHandleIcon}
            padding={2}
            aria-label="Drag to change the order"
            style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
            {...attributes}
            {...listeners}
          />
        )}
        <div style={{ ...ROW_GRID, opacity: hidden ? 0.5 : 1 }}>
          <PickOrType id={`spec-label-${spec._key}`} value={spec.label} placeholder="Label, e.g. Seats" choices={labels} readOnly={readOnly} inputRef={register(spec._key, "label")} onChange={(v) => onField(spec._key, "label", v)} />
          <PickOrType id={`spec-value-${spec._key}`} value={spec.value} placeholder={preset?.hint ?? "Value"} choices={preset?.values ?? []} readOnly={readOnly} inputRef={register(spec._key, "value")} onChange={(v) => onField(spec._key, "value", v)} />
        </div>
        {!readOnly && (
          <>
            <Tooltip content={tip(hidden ? "Hidden on the website. Click to show it" : "Hide on the website (stays here)")} placement="top" portal>
              <Button mode="bleed" padding={2} icon={hidden ? EyeClosedIcon : EyeOpenIcon} aria-label={hidden ? "Show on website" : "Hide on website"} onClick={() => onToggle(spec)} />
            </Tooltip>
            <Tooltip content={tip("Remove")} placement="top" portal>
              <Button mode="bleed" tone="critical" padding={2} icon={TrashIcon} aria-label="Remove" onClick={() => onRemove(spec._key)} />
            </Tooltip>
          </>
        )}
      </Flex>
    </Card>
  );
}

type VehicleDoc = Record<string, unknown> & { _id?: string; _type?: string; mileage?: unknown };

/** A value left in the old Mileage box: move it into the list (or drop it when the list has Mileage). */
function OldMileage({ specs, itemType, readOnly }: { specs: Spec[]; itemType: string; readOnly?: boolean }) {
  const doc = useFormValue([]) as VehicleDoc | undefined;
  const { patch } = useDocumentOperation(getPublishedId(doc?._id ?? ""), doc?._type ?? "vehicle");
  const old = typeof doc?.mileage === "string" ? doc.mileage.trim() : "";
  if (!old || readOnly) return null;
  const row = specs.find((s) => isMileage(s.label));
  const add = [{ setIfMissing: { specs: [] } }, { insert: { after: "specs[-1]", items: [{ _type: itemType, _key: newKey(), label: "Mileage", value: old }] } }];
  // One change, seeded with the form's value (a document not saved yet starts from what the form shows).
  const move = () => patch.execute([...(row ? [] : add), { unset: ["mileage"] }], doc);
  const text = row
    ? `The old Mileage box still holds "${old}". The website shows your Mileage row instead.`
    : `Mileage "${old}" is still in the old Mileage box, which is no longer in this form. The website shows it; move it into the list to edit it here.`;
  return (
    <Card padding={3} radius={2} tone="caution" border>
      <Flex gap={3} align="center" wrap="wrap">
        <Box flex={1} style={{ minWidth: 200 }}>
          <Text size={1}>{text}</Text>
        </Box>
        <Button fontSize={1} padding={2} mode={row ? "ghost" : "default"} tone={row ? "default" : "primary"} text={row ? "Remove old value" : "Move into the list"} disabled={!!patch.disabled} onClick={move} />
      </Flex>
    </Card>
  );
}

export default function SpecsInput(props: ArrayOfObjectsInputProps) {
  const { onChange, readOnly } = props;
  const specs = (props.value ?? []) as Spec[];
  const group = useFormValue(["group"]);
  const presets = specPresets(group);
  const itemType = props.schemaType.of[0]?.name ?? "spec";
  const inputs = useRef(new Map<string, HTMLInputElement>());
  const [focus, setFocus] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // A row just added: its empty box gets the cursor once the row is on screen (after the menu has
  // closed and handed focus back to its button).
  useEffect(() => {
    const el = focus ? inputs.current.get(focus) : undefined;
    if (!el) return;
    const timer = setTimeout(() => {
      el.focus();
      setFocus(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [focus, specs]);

  const register = (key: string, field: Field) => (el: HTMLInputElement | null) => {
    if (el) inputs.current.set(`${key}:${field}`, el);
    else inputs.current.delete(`${key}:${field}`);
  };
  const add = (label: string) => {
    const key = newKey();
    onChange([setIfMissing([]), insert([{ _type: itemType, _key: key, ...(label ? { label } : {}) }], "after", [-1])]);
    setFocus(`${key}:${label ? "value" : "label"}`);
  };
  const onField = (key: string, field: Field, value: string) => onChange(value ? set(value, [{ _key: key }, field]) : unset([{ _key: key }, field]));
  const onToggle = (s: Spec) => onChange(set(s.hidden !== true, [{ _key: s._key }, HIDDEN_FIELD]));
  const onRemove = (key: string) => onChange(unset([{ _key: key }]));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const keys = specs.map((s) => s._key);
    onChange(set(arrayMove(specs, keys.indexOf(String(active.id)), keys.indexOf(String(over.id)))));
  };

  const used = new Set(specs.map((s) => (s.label ?? "").trim().toLowerCase()));
  const unused = presets.filter((p) => !used.has(p.label.toLowerCase()));
  const labels = presets.map((p) => p.label);
  // The usual rows (Seats, Transmission, Fuel, Mileage for cars) this vehicle does not have yet: one click each.
  const missing = defaultSpecLabels(group).filter((l) => !used.has(l.toLowerCase()));

  return (
    <Stack space={3}>
      <OldMileage specs={specs} itemType={itemType} readOnly={readOnly} />
      {specs.length ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragEnd={onDragEnd}>
          <SortableContext items={specs.map((s) => s._key)} strategy={verticalListSortingStrategy}>
            <Stack space={2}>
              {specs.map((s) => (
                <SpecRow key={s._key} spec={s} group={group} labels={labels} readOnly={readOnly} register={register} onField={onField} onToggle={onToggle} onRemove={onRemove} />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      ) : (
        <Card padding={3} radius={2} border tone="transparent">
          <Text size={1} muted>No specifications yet. Use Add specification to pick {presets.slice(0, 3).map((p) => p.label).join(", ")} and more.</Text>
        </Card>
      )}
      {!readOnly && (
        <Flex gap={2} wrap="wrap" align="center">
          {missing.map((l) => (
            <Button key={l} mode="ghost" icon={AddIcon} text={l} fontSize={1} padding={3} onClick={() => add(l)} />
          ))}
          <MenuButton
            id={`${props.id}-add`}
            button={<Button icon={AddIcon} iconRight={ChevronDownIcon} text={missing.length ? "More" : "Add specification"} mode="ghost" fontSize={1} padding={3} />}
            menu={
              <Menu>
                {unused.map((p) => <MenuItem key={p.label} text={p.label} onClick={() => add(p.label)} />)}
                {unused.length > 0 && <MenuDivider />}
                <MenuItem icon={EditIcon} text="Other: type your own label" onClick={() => add("")} />
              </Menu>
            }
            popover={{ portal: true, placement: "bottom-start", constrainSize: true }}
          />
        </Flex>
      )}
    </Stack>
  );
}

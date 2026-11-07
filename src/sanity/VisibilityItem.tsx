"use client";
import { PatchEvent, set, useFormCallbacks, type ItemProps, type ObjectSchemaType } from "sanity";
import { Box, Button, Flex, Text, Tooltip } from "@sanity/ui";
import { EyeClosedIcon, EyeOpenIcon } from "@sanity/icons";
import { HIDDEN_FIELD } from "./schemaTypes/visibility";

const tip = (text: string) => <Box padding={2}><Text size={1}>{text}</Text></Box>;

/** List items (slides, cards, banners, steps...) get an eye next to their row to show / hide them on the website. */
function ToggleableItem(props: ItemProps) {
  // Inside an item, form callbacks are scoped to that item, so the path is just the field name.
  const { onChange } = useFormCallbacks();
  const hidden = (props.value as Record<string, unknown> | undefined)?.[HIDDEN_FIELD] === true;
  return (
    <Flex align="center" gap={1}>
      <Box flex={1} style={{ minWidth: 0, opacity: hidden ? 0.5 : 1 }}>{props.renderDefault(props)}</Box>
      <Tooltip content={tip(hidden ? "Hidden on the website. Click to show" : "Click to hide on the website")} placement="top" portal>
        <Button
          mode="bleed"
          padding={2}
          icon={hidden ? EyeClosedIcon : EyeOpenIcon}
          aria-label={hidden ? "Show on website" : "Hide on website"}
          disabled={props.readOnly}
          onClick={() => onChange(PatchEvent.from(set(!hidden, [HIDDEN_FIELD])))}
        />
      </Tooltip>
    </Flex>
  );
}

/** Registered as the form's item component; only object items that have the `hidden` flag are changed. */
export default function VisibilityItem(props: ItemProps) {
  const fields = (props.schemaType as ObjectSchemaType).fields;
  if (Array.isArray(fields) && fields.some((f) => f.name === HIDDEN_FIELD)) return <ToggleableItem {...props} />;
  return props.renderDefault(props);
}

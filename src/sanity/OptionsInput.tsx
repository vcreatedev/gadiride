"use client";
/**
 * A vehicle's Options (the ticks on its page, e.g. Self drive, With driver): the usual tag box, plus
 * the common options for the vehicle's group one click away.
 */
import { insert, setIfMissing, useFormValue, type ArrayOfPrimitivesInputProps } from "sanity";
import { Button, Flex, Stack, Text } from "@sanity/ui";
import { AddIcon } from "@sanity/icons";
import { optionPresets } from "./vehicleForm";

export default function OptionsInput(props: ArrayOfPrimitivesInputProps) {
  const group = useFormValue(["group"]);
  const have = new Set(((props.value ?? []) as unknown[]).map((v) => String(v).trim().toLowerCase()));
  const missing = optionPresets(group).filter((o) => !have.has(o.toLowerCase()));
  const add = (option: string) => props.onChange([setIfMissing([]), insert([option], "after", [-1])]);
  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      {!props.readOnly && missing.length > 0 && (
        <Flex gap={2} wrap="wrap" align="center">
          <Text size={1} muted>Quick add:</Text>
          {missing.map((o) => <Button key={o} mode="ghost" icon={AddIcon} text={o} fontSize={1} padding={2} onClick={() => add(o)} />)}
        </Flex>
      )}
    </Stack>
  );
}

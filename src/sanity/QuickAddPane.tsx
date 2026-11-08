"use client";
import type { UserComponent } from "sanity/structure";
import { Box } from "@sanity/ui";
import type { ItemList } from "./pageMap";
import { ItemListBlock } from "./SectionItems";

/**
 * "Add vehicles" → one service (or Drivers): the same list as on that service's page, with Add,
 * drag to reorder, show / hide and delete on every row. Clicking a row opens it to the right.
 */
const QuickAddPane: UserComponent = ({ options }) => {
  const list = options?.list as ItemList;
  return (
    <Box padding={3}>
      <ItemListBlock list={list} />
    </Box>
  );
};

export default QuickAddPane;

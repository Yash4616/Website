"use client";

import { site } from "@/content/client";
import Field from "./Field";

/** The Field with its content. One lazy chunk: code and data arrive together. */
export default function FieldEntry({ active }: { active: boolean }) {
  return <Field site={site} active={active} />;
}

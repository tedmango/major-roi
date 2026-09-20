import type { IncomeBracket } from "@/lib/types";

export const INCOME_BRACKETS: { value: IncomeBracket; label: string }[] = [
  { value: "0-30000", label: "Under $30k" },
  { value: "30001-48000", label: "$30k–$48k" },
  { value: "48001-75000", label: "$48k–$75k" },
  { value: "75001-110000", label: "$75k–$110k" },
  { value: "110001-plus", label: "Over $110k" },
  { value: "unknown", label: "Not sure" },
];

export function isIncomeBracket(value: string | null): value is IncomeBracket {
  return INCOME_BRACKETS.some((b) => b.value === value);
}

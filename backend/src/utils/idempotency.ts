import { v4 as uuidv4 } from "uuid";

export function generateIdempotencyKey(prefix = "idem"): string {
  return `${prefix}_${uuidv4().replace(/-/g, "")}`;
}

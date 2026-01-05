// lib/uiErrors.ts
export function mapErrorToMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes("Insufficient batch stock"))
      return "Not enough stock for this item";
    if (err.message.includes("No active batch"))
      return "Item is out of stock";
    return err.message;
  }
  return "Something went wrong";
}

export function classifySyncError(error: any) {
  const msg = error?.message?.toLowerCase?.() ?? "";

  // 🔴 PERMANENT
  if (
    msg.includes("check constraint") ||
    msg.includes("violates check constraint") ||
    msg.includes("insufficient stock") ||
    msg.includes("already fully allocated")
  ) {
    return {
      type: "permanent",
      reason: msg,
    };
  }

  if (msg.includes("duplicate key value")) {
    return {
      type: "permanent",
      reason: "duplicate_record",
    };
  }

  // 🟢 RETRYABLE
  if (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("timeout")
  ) {
    return {
      type: "retry",
    };
  }

  // 🟡 DEFAULT → retry a few times
  return {
    type: "retry",
  };
}

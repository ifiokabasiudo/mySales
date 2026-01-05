import { useState } from "react";
import { toast } from "react-toastify";
import { mapErrorToMessage } from "@/lib/uiErrors";

type SafeActionOptions = {
  success?: string;
  loading?: string;
  error?: string;
};

export function useSafeAction() {
  const [isLoading, setIsLoading] = useState(false);

  async function run<T>(
    fn: () => Promise<T>,
    options?: SafeActionOptions
  ): Promise<T | null> {
    if (isLoading) return null;

    setIsLoading(true);

    try {
      options?.loading && toast.info(options.loading);

      const result = await fn();

      options?.success && toast.success(options.success);
      return result;
    } catch (err) {
      const message =
        options?.error ?? mapErrorToMessage(err);

      toast.error(message);
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { run, isLoading };
}

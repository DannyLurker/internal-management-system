"use client";
import { useEffect } from "react";
import { registerApiListeners } from "@/shared/lib/api-client";
import { toast } from "sonner";
import { useGlobalLoading } from "../../context/LoadingContext";

export function InterceptorConfig() {
  const { setIsLoading } = useGlobalLoading();

  useEffect(() => {
    registerApiListeners(setIsLoading, (msg: string) => {
      toast.error(msg);
    });
  }, [setIsLoading]);

  return null;
}

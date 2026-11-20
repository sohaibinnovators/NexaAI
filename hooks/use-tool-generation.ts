"use client";

import { useCallback, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { requestToolGeneration } from "@/lib/tools/client";
import type { ToolRequestPayload } from "@/lib/tools/types";
import { recordToolSuccess } from "@/lib/workspace/record-tool";

export function useToolGeneration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [canRegenerate, setCanRegenerate] = useState(false);
  const sendingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastPayloadRef = useRef<ToolRequestPayload | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    sendingRef.current = false;
    setLoading(false);
  }, []);

  const generate = useCallback(
    async (payload: ToolRequestPayload) => {
      if (sendingRef.current) return null;

      sendingRef.current = true;
      setLoading(true);
      setError(null);
      lastPayloadRef.current = payload;
      setCanRegenerate(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await requestToolGeneration(payload, controller.signal);
        if (!data.ok) {
          setError(data.error.message);
          toast({
            title: "Generation failed",
            description: data.error.message,
            tone: "error",
          });
          return null;
        }

        setResult(data.result);
        setExplanation(data.explanation ?? null);
        setSubject(data.subject ?? null);
        setBody(data.body ?? null);
        recordToolSuccess(payload, data.result);
        toast({
          title: "Generated successfully",
          tone: "success",
        });
        return data;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          const message = "Request stopped.";
          setError(message);
          toast({ title: "Request stopped", tone: "default" });
          return null;
        }

        const message =
          "Network error while contacting the AI service. Please try again.";
        setError(message);
        toast({
          title: "Network error",
          description: message,
          tone: "error",
        });
        return null;
      } finally {
        abortRef.current = null;
        sendingRef.current = false;
        setLoading(false);
      }
    },
    [toast],
  );

  const regenerate = useCallback(async () => {
    if (!lastPayloadRef.current) return null;
    return generate(lastPayloadRef.current);
  }, [generate]);

  const clearOutput = useCallback(() => {
    setResult("");
    setExplanation(null);
    setSubject(null);
    setBody(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    explanation,
    subject,
    body,
    setResult,
    setSubject,
    setBody,
    setError,
    generate,
    regenerate,
    clearOutput,
    stop,
    canRegenerate,
  };
}

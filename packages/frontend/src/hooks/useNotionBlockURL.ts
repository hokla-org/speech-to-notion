import { useState, useCallback } from "react";

type Status = "ready" | "valid" | "invalid";

type UseNotionBlockURLReturn =
  | { status: "ready"; checkAccess: (notionUrl: string) => Promise<boolean> }
  | {
      status: "valid";
      blockId: string;
      checkAccess: (notionUrl: string) => Promise<boolean>;
    }
  | {
      status: "invalid";
      error: string;
      checkAccess: (notionUrl: string) => Promise<boolean>;
    };

export const useNotionBlockURL = (): UseNotionBlockURLReturn => {
  const [status, setStatus] = useState<Status>("ready");
  const [blockId, setBlockId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const checkAccess = useCallback(
    async (notionUrl: string): Promise<boolean> => {
      setStatus("ready");
      setBlockId(undefined);
      setError(undefined);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/notion/check-access`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ notion_url: notionUrl }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data.block_id) {
          setStatus("valid");
          setBlockId(data.block_id);
          return true;
        } else if (data.error) {
          setStatus("invalid");
          setError(data.error);
          return false;
        }
      } catch (err) {
        setStatus("invalid");
        setError(err instanceof Error ? err.message : String(err));
        return false;
      }
      return false;
    },
    []
  );

  switch (status) {
    case "valid":
      return { status, blockId: blockId!, checkAccess };
    case "invalid":
      return { status, error: error!, checkAccess };
    default:
      return { status, checkAccess };
  }
};

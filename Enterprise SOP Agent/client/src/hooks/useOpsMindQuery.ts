import type { OpsMindRequest, OpsMindResponse } from "../../../src/types";

export function useOpsMindQuery() {
  const query = async (request: OpsMindRequest): Promise<OpsMindResponse> => {
    const response = await fetch("/api/opsmind", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  };

  return { query };
}

/** One external integration's state, for GET /integrations/status (docs/INTEGRATIONS.md) */
export interface IntegrationStatus {
  /** `ok`: usable; `not_configured`: missing setup; `unreachable`: set up but a check failed */
  state: 'ok' | 'not_configured' | 'unreachable';
  /** What is set up, in a sentence */
  summary: string;
  /** How to fix it, when it isn't ok */
  action?: string;
  details?: Record<string, unknown>;
}

/** Per-project integrations (Argos, OpenReplay): counts, and with `check`, which projects can't be reached */
export interface ProjectIntegrationSummary {
  projects: number;
  /** Projects with credentials (an Argos token, an OpenReplay API key) */
  withCredentials: number;
  /** Only with `check`: projects whose service didn't answer */
  unreachable?: Array<{ projectId: string; name: string; error: string }>;
}

/** Runs checks a few at a time, each with a deadline */
export async function checkEach<T>(
  items: T[],
  check: (item: T) => Promise<void>,
  options: { concurrency?: number; timeoutMs?: number } = {},
): Promise<Array<{ item: T; error: string }>> {
  const { concurrency = 4, timeoutMs = 5000 } = options;
  const failures: Array<{ item: T; error: string }> = [];
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const item = items[next++];
      let timer: NodeJS.Timeout | undefined;
      try {
        await Promise.race([
          check(item),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error(`No answer within ${timeoutMs / 1000} seconds`)), timeoutMs);
          }),
        ]);
      } catch (error) {
        failures.push({ item, error: (error as Error).message });
      } finally {
        clearTimeout(timer);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return failures;
}

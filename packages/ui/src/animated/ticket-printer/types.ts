export type DeployStatus = "ready" | "error" | "canceled" | "building";

export interface Deploy {
  /** Unique per deploy (Vercel deployment uid, Actions run id). A new id on top prints a new ticket. */
  id: string;
  /** "building" deploys light the printer but don't print until they finish. */
  status: DeployStatus;
  /** Project or repository name, printed at the top of the ticket. */
  project?: string;
  /** Environment, e.g. "production" or "preview". */
  target?: string;
  branch?: string;
  /** Full or short commit SHA; the ticket shows the first 7 characters. */
  sha?: string;
  /** Commit message. Only its first line is printed. */
  message?: string;
  /** Link to the deploy (inspector, run page). */
  url?: string;
  /** When the deploy started: ISO string, epoch ms or Date. */
  date?: string | number | Date | null;
  /** How long the build took, in ms. */
  duration?: number | null;
  /** Ticket number. Defaults to one derived from the id. */
  number?: number;
}

export type DeploySource = "vercel" | "github";

/** Earlier tickets the hover can feed out, above the latest. */
export const MAX_HISTORY = 4;

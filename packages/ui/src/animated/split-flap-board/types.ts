export interface Commit {
  /** The commit message. Only its first line is shown. */
  message: string;
  /** Repository name, e.g. "adgrid-ui". */
  repo?: string;
  /** Full or short SHA; the footer shows the first 7 characters. */
  sha?: string;
  /** Link to the commit. */
  url?: string;
  /** When it was authored: ISO string, epoch ms or Date. */
  date?: string | number | Date | null;
}

/** Earlier commits the hover can reveal, under the latest. */
export const MAX_HISTORY = 4;

import type { RegistryEntry } from "@/registry";

export interface PresentationSourceFile {
  path: string;
  code: string;
  html?: string;
}

export interface PresentationPayload {
  entry: RegistryEntry;
  rawCode: string;
  sourceFiles: PresentationSourceFile[];
}


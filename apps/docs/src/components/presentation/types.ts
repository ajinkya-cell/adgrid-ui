import type { RegistryEntry } from "@/registry";

export interface PresentationSourceFile {
  path: string;
  code: string;
}

export interface PresentationPayload {
  entry: RegistryEntry;
  rawCode: string;
  sourceFiles: PresentationSourceFile[];
}


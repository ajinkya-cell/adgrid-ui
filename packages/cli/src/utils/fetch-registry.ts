interface RegistryResponse {
  name: string;
  slug: string;
  description: string;
  dependencies: string[];
  files: Record<string, string>;
  registryDependencies: string[];
}

export async function fetchComponent(
  registryUrl: string,
  slug: string
): Promise<RegistryResponse> {
  const url = `${registryUrl.replace(/\/$/, "")}/${slug}`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        `Component "${slug}" not found. Run \`npx adgrid-ui list\` to see available components.`
      );
    }
    throw new Error(`Registry request failed: ${res.statusText}`);
  }

  return res.json() as Promise<RegistryResponse>;
}

export async function listComponents(
  registryUrl: string
): Promise<Array<{ slug: string; name: string; category: string; description: string; dependencies: string[] }>> {
  const url = `${registryUrl.replace(/\/$/, "")}/index`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Registry request failed: ${res.statusText}`);
  return res.json() as any;
}

import { execSync } from "child_process";
import type { PackageManager } from "./detect-pm";

export async function installDependencies(
  pm: PackageManager,
  deps: string[]
): Promise<void> {
  const cmdMap: Record<PackageManager, (deps: string[]) => string> = {
    npm: (d) => `npm install ${d.join(" ")}`,
    pnpm: (d) => `pnpm add ${d.join(" ")}`,
    yarn: (d) => `yarn add ${d.join(" ")}`,
    bun: (d) => `bun add ${d.join(" ")}`,
  };

  execSync(cmdMap[pm](deps), {
    stdio: "pipe",
    cwd: process.cwd(),
  });
}

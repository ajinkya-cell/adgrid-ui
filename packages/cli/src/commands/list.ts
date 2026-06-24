import chalk from "chalk";
import ora from "ora";
import { listComponents } from "../utils/fetch-registry";

interface ListOptions {
  registry?: string;
}

export async function listCommand(options: ListOptions) {
  const spinner = ora("Fetching components...").start();
  try {
    const registryUrl =
      options.registry ?? "https://void-ui.vercel.app/api/registry";

    const components = await listComponents(registryUrl);
    spinner.succeed("Available components:");
    console.log("");

    // Group components by category
    const grouped: Record<string, typeof components> = {};
    for (const comp of components) {
      const category = comp.category || "other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(comp);
    }

    for (const [category, items] of Object.entries(grouped)) {
      console.log(`  ${chalk.bold(category)}/`);
      for (const item of items) {
        const slugStr = item.slug.padEnd(20);
        console.log(`    ${chalk.cyan(slugStr)} ${item.name}`);
      }
    }
    console.log("");
  } catch (error: any) {
    spinner.fail(`Failed to fetch components: ${error.message}`);
  }
}

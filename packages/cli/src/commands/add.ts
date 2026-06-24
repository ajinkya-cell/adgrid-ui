import path from "path";
import ora from "ora";
import chalk from "chalk";
import { fetchComponent } from "../utils/fetch-registry";
import { installDependencies } from "../utils/install-deps";
import { detectPackageManager } from "../utils/detect-pm";
import { writeFiles } from "../utils/write-files";

interface AddOptions {
  output?: string;
  registry?: string;
}

export async function addCommand(component: string, options: AddOptions) {
  const spinner = ora();

  // 1. Resolve registry URL
  const registryUrl =
    options.registry ?? "https://void-ui.vercel.app/api/registry";

  // 2. Fetch component
  spinner.start(`Fetching ${chalk.cyan(component)}...`);
  try {
    const entry = await fetchComponent(registryUrl, component);
    spinner.succeed(`Fetched ${chalk.cyan(entry.name)}`);

    // 3. Write files
    spinner.start("Writing files...");
    const cwd = process.cwd();
    const outputDir = path.resolve(cwd, options.output ?? "components/ui");
    const srcDir = path.resolve(cwd, "src");
    const isSrcProject = outputDir.split(path.sep).includes("src");
    const libDir = isSrcProject
      ? path.resolve(outputDir, "../../lib")
      : path.resolve(cwd, "lib");

    const writtenFiles = await writeFiles(entry.files, outputDir, libDir);
    spinner.succeed("Files written:");
    for (const f of writtenFiles) {
      console.log(`  ${chalk.green("✓")} Wrote ${path.relative(cwd, f)}`);
    }

    // 4. Install dependencies
    if (entry.dependencies && entry.dependencies.length > 0) {
      spinner.start("Installing dependencies...");
      const pm = detectPackageManager(cwd);
      await installDependencies(pm, entry.dependencies);
      spinner.succeed(
        `Installed: ${chalk.dim(entry.dependencies.join(", "))}`
      );
    }

    // 5. Print success
    const componentName = entry.name.replace(/\s/g, "");
    const fileBaseName = entry.slug;
    const importPath = isSrcProject
      ? `../${path.relative(srcDir, outputDir).replace(/\\/g, "/")}/${fileBaseName}`
      : `@/components/ui/${fileBaseName}`;

    console.log("");
    console.log(chalk.green("✓ Component added successfully!"));
    console.log("");
    console.log(chalk.dim("Import it:"));
    console.log(`  import { ${componentName} } from "${importPath}"`);
    console.log("");
  } catch (error: any) {
    spinner.fail(`Failed to add component: ${error.message}`);
  }
}

import chalk from "chalk";

export async function initCommand() {
  console.log("");
  console.log(chalk.cyan("Initializing Void UI in your project..."));
  console.log(chalk.yellow("Note: init command is currently a placeholder."));
  console.log(
    chalk.green(
      "✓ Project is ready. Use `npx void-ui add <component>` to add components."
    )
  );
  console.log("");
}

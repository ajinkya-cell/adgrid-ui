#!/usr/bin/env node
import { Command } from "commander";
import { addCommand } from "./commands/add";
import { initCommand } from "./commands/init";
import { listCommand } from "./commands/list";

const program = new Command()
  .name("void-ui")
  .description("CLI tool for Void UI components")
  .version("0.1.0");

program
  .command("add")
  .description("Add a component to your project")
  .argument("<component>", "Component slug (e.g., image-reveal)")
  .option("-o, --output <path>", "Output directory", "components/ui")
  .option("--registry <url>", "Registry URL")
  .action(addCommand);

program
  .command("init")
  .description("Initialize AdGrid UI in your project")
  .option("--registry <url>", "Registry URL")
  .action(initCommand);

program
  .command("list")
  .description("List all available components")
  .option("--registry <url>", "Registry URL")
  .action(listCommand);

program.parse();

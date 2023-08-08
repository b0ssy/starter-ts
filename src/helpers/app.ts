import { Command } from "commander";

export { Command };

// Generic command line application
export abstract class App {
  abstract create(program: Command): void;
}

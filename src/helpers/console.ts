import chalk from "chalk";
import prompt from "password-prompt";

export const consoleSuccess = (msg?: unknown) => {
  console.log(msg ? chalk.greenBright(msg) : "");
};

export const consoleError = (msg?: unknown) => {
  console.log(msg ? chalk.redBright(msg) : "");
};

export const promptPlain = async (ask: string) => {
  return prompt(ask);
};

export const promptPassword = async (ask: string) => {
  return prompt(ask, { method: "hide" });
};

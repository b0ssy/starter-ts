declare module "password-prompt" {
  function password_prompt(
    ask: string,
    options?: { method: "hide" }
  ): Promise<string>;
  export = password_prompt;
}

import chalk from "chalk";

/**
 * Check for a specific problem within a group
 * @param callback Callback
 *   If boolean, return false to indicate error
 *   If function, throw exception to indicate error
 * @param message Message
 */
export const check = async (
  callback: (() => Promise<void>) | boolean,
  message: string,
) => {
  if (typeof callback === "boolean" && !callback) {
    throw new Error(message);
  } else if (typeof callback === "function") {
    try {
      await callback();
    } catch (err) {
      throw new Error(message);
    }
  }
};

/**
 * Check a group for problems and log success/error
 * @param callback Callback. Throw exception to indicate error.
 * @param message Message
 */
export const checkGroup = async (
  message: string,
  callback: () => Promise<void>,
) => {
  try {
    await callback();
    console.log(chalk.greenBright(`✓ ${message}`));
    // eslint-disable-next-line
  } catch (err: any) {
    console.log(chalk.redBright(`✘ ${message} - ${err?.message}`));
  }
};

/**
 * Check based on configurations
 * @param config Check configuration
 */
export const checkConfig = async (
  groups: [string, [(() => Promise<void>) | boolean, string][]][],
) => {
  for (const group of groups) {
    await checkGroup(group[0], async () => {
      for (const checkItem of group[1]) {
        await check(checkItem[0], checkItem[1]);
      }
    });
  }
};

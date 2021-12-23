import {
  Browser,
  CustomPuppeteerModuleName,
  PuppeteerLaunchParam,
  PuppeteerLib,
} from "./puppeteer-common";
import * as fsp from "fs/promises";

const DEFAULT_PUPPETEER: CustomPuppeteerModuleName =
  process.env["W2M_DEFAULT_PUPPETEER"] || "puppeteer-core";

export interface SetupBrowserConfig {
  puppeteer: CustomPuppeteerModuleName;
  launch: PuppeteerLaunchParam | undefined;
}

export type SetupBrowserConfigInput = Partial<SetupBrowserConfig>;

export default async function setupBrowser({
  puppeteer = DEFAULT_PUPPETEER,
  launch,
}: SetupBrowserConfig): Promise<Browser> {
  const m = await import(puppeteer);

  const lib: PuppeteerLib = m.default || m;

  const userDataDir = launch?.userDataDir || "./.chromium-profile";

  await fsp.mkdir(userDataDir, { recursive: true });

  const browser = await lib.launch({
    ...launch,
    userDataDir,
  });

  return browser;
}

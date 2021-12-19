import { SetupBrowserConfig } from "./config";
import { Browser, PuppeteerLib } from "./ctx";
import * as fsp from "fs/promises";

export default async function setupBrowser({
  puppeteer = "puppeteer-core",
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

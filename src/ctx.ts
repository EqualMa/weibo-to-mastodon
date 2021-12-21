import setupBrowser from "./browser";
import { SetupCtxConfig } from "./config";
import { getDelayFunc } from "./delay";
import { Browser, Page } from "./puppeteer-common";

export interface GlobalContext {
  browser: Browser;
  delay: () => Promise<void>;
}

export interface PageContext extends GlobalContext {
  /** puppeteer page */
  page: Page;
}

export async function setupCtx(config: SetupCtxConfig): Promise<GlobalContext> {
  const browser = await setupBrowser(config);
  return {
    browser,
    delay: getDelayFunc(config.delay),
  };
}

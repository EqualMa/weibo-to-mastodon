import type * as pp from "puppeteer";
import type * as ppc from "puppeteer-core";
import setupBrowser from "./browser";
import { SetupCtxConfig } from "./config";
import { getDelayFunc } from "./delay";

export type PuppeteerLib =
  | typeof import("puppeteer")
  | typeof import("puppeteer-core");

export type Browser = pp.Browser | ppc.Browser;

export interface GlobalContext {
  browser: Browser;
  delay: () => Promise<void>;
}

export type Page = pp.Page | ppc.Page;

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

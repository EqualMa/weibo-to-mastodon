import type { Page } from "puppeteer";

export interface WeiboCrawlerContext {
  /** puppeteer page */
  page: Page;
  delay: () => Promise<void>;
}

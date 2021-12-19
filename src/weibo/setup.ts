import { PageContext, GlobalContext } from "../ctx";
import * as uu from "./url";

export interface WeiboUserPageContext extends PageContext {
  uid: string;
}

export async function setupWeiboUserPage({
  uid,
  browser,
  ...ctx
}: { uid: string } & GlobalContext): Promise<WeiboUserPageContext> {
  const page = await browser.newPage();

  const url = uu.user(uid);
  await page.goto(url);
  if (!page.url().startsWith(url)) {
    await page.waitForFrame(url);
  }
  await page.waitForFunction(() => {
    console.log(!!(window as any).$cookies);
    return !!(window as any).$cookies;
  });

  return { ...ctx, browser, page, uid };
}

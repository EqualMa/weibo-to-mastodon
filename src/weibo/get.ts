import * as pp from "puppeteer";
import { WeiboCrawlerContext } from "../ctx";

import * as ip from "./input";
import * as d from "./data";

async function getWeiboListPageOfUser({
  ctx,
  uid,
  page,
}: {
  ctx: WeiboCrawlerContext;
  uid: string;
  /** starting from 0 */
  page: number;
}) {
  await ctx.page.evaluate(async () => {
    const xsrf = (window as any).$cookies.get("XSRF-TOKEN");

    const url = `https://weibo.com/ajax/statuses/mymblog?uid=${uid}&page=${page}&feature=0`;

    const resp = await fetch(url, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "zh,zh-CN;q=0.9,en;q=0.8",
        "x-requested-with": "XMLHttpRequest",
        "x-xsrf-token": xsrf,
      },
      referrer: `https://weibo.com/u/${uid}`,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    });

    const res: { ok: number; data: { list: ip.MBlog[] } } = await resp.json();

    if (res.ok !== 1) {
      throw new Error(`fetch ${url} ok=${res.ok}`);
    }

    res.data.list.map();
  });
}

export function getLatestWeiboListOfUser({
  ctx,
  uid,
  limit = 10,
}: {
  ctx: WeiboCrawlerContext;
  uid: string;
  limit?: number;
}) {}

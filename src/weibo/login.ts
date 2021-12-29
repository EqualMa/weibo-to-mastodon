import { ElementHandle } from "puppeteer-core";
import { PageContext } from "../ctx";
// import getImgData from "../util/bs/img-data";

export interface WeiboLoggedInUser {
  screenName: string;
}

interface WeiboLoggedInUserInput {
  screen_name: string;
}

async function checkLoggedIn(
  ctx: PageContext
): Promise<WeiboLoggedInUser | null> {
  const user = await ctx.page.evaluate(getWeiboLoggedInUser);

  return user
    ? {
        screenName: user.screen_name,
      }
    : null;
}

function getWeiboLoggedInUser(): WeiboLoggedInUserInput | undefined {
  const user = (window as any).$CONFIG?.user as
    | WeiboLoggedInUserInput
    | undefined;
  return user;
}

async function waitToLogin(ctx: PageContext): Promise<WeiboLoggedInUser> {
  const handle = await ctx.page.waitForFunction(getWeiboLoggedInUser, {
    polling: 500,
    timeout: 0,
  });

  const user = await handle.jsonValue<WeiboLoggedInUser>();

  return user;
}

export async function ensureLogin(
  ctx: PageContext
): Promise<WeiboLoggedInUser> {
  const els = await ctx.page.$x('//a[text()="登录"]');

  const u = await checkLoggedIn(ctx);

  if (u) {
    return u;
  }

  if (els.length !== 1) {
    throw new Error(`Weibo unique login button not found. Found ${els.length}`);
  }

  const elBtn = els[0];
  await elBtn.click();

  const elImg: null | ElementHandle<HTMLImageElement> =
    await ctx.page.waitForXPath(
      '//*[contains(@class, "LoginPop_mabox")]//img[@src]'
    );

  if (!elImg) {
    throw new Error("Weibo login qrcode not found");
  }

  const data = await elImg.evaluate((img) => {
    const p = new URL(img.src).searchParams;
    const data = p.get("data") || "";
    return data;
  });

  //   // fix "The canvas has been tainted by cross-origin data."
  //   await elImg.evaluate((img: HTMLImageElement) => {
  //     img.crossOrigin = "Anonymous";
  //   });

  //   // wait for img loaded
  //   await ctx.page.waitForFunction(
  //     async (img: HTMLImageElement) => {
  //       return img.complete && img.naturalWidth > 0;
  //     },
  //     { polling: 500 },
  //     elImg
  //   );

  //   // decode QRCode to get data
  //   const res = await elImg.evaluate(getImgData);

  //   const buf = Buffer.from(res.binString, "binary");

  //   const { default: jsQR } = await import("jsqr");

  //   const code = jsQR(new Uint8ClampedArray(buf), res.width, res.height);

  //   if (!code) {
  //     throw new Error("QRCode not resolved");
  //   }

  //   const { data } = code;

  const QRCode = await import("qrcode");

  const str = await QRCode.toString(data, { type: "terminal" });

  console.warn("Please scan the code to login to https://weibo.com");
  console.warn(str);

  const user = await waitToLogin(ctx);

  return user;
}

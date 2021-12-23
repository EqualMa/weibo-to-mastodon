import { OperationDelayOption } from "./delay";
import { SetupBrowserConfig } from "./browser";
import * as fsp from "fs/promises";
import { CustomPuppeteerModuleName } from "./puppeteer-common";

export interface SetupCtxConfig extends SetupBrowserConfig {
  /** default to `"random"` */
  delay: OperationDelayOption;
}

const DEFAULT_PUPPETEER: CustomPuppeteerModuleName =
  process.env["W2M_DEFAULT_PUPPETEER"] || "puppeteer-core";

export interface WeiboToMastodonConfig extends SetupCtxConfig {
  defaultMastodonBaseUrl: string | undefined;
  syncList: {
    weibo: { userId: string };
    mastodon: {
      baseUrl?: string;
      accessToken: string;
      checkHistory?: number;
    };
  }[];
  stopAfterFailed: boolean;
}

export type WeiboToMastodonConfigInput = Partial<WeiboToMastodonConfig>;

async function parseJsonc<T>(txt: string): Promise<T> {
  const m = await import("jsonc-parser");
  return m.parse(txt);
}

export async function resolveConfig(): Promise<WeiboToMastodonConfig> {
  const txt = await fsp.readFile(".w2mrc.json", "utf-8").catch((_err) => "");
  const json: WeiboToMastodonConfigInput = txt.trim()
    ? await parseJsonc(txt)
    : {};
  //   TODO: validate

  const {
    //
    puppeteer = DEFAULT_PUPPETEER,
    launch,
    delay = "random",
    defaultMastodonBaseUrl,
    syncList = [],
    stopAfterFailed = false,
  } = json;

  return {
    puppeteer,
    launch,
    delay,
    defaultMastodonBaseUrl,
    syncList,
    stopAfterFailed,
  };
}

export function infoConfig(config: WeiboToMastodonConfig) {
  const {
    puppeteer,
    launch,
    defaultMastodonBaseUrl,
    syncList,
    ...otherConfigs
  } = config;
  console.info("Using WeiboToMastodonConfig:");
  console.info(
    `[puppeteer] import puppeteer from ${JSON.stringify(puppeteer)}`
  );
  console.info(`[launch]${launch ? "" : ` ${String(launch)}`}`);
  if (launch) {
    const { args, ...otherLaunchOptions } = launch;

    if (!args) console.info(`[launch.args] ${String(args)}`);
    else if (args.length === 0) {
      console.info(`[launch.args] empty array`);
    } else {
      console.info(`[launch.args] ${args.length} items`);
      for (const arg of args) {
        console.info(` * ${arg}`);
      }
    }

    const kvList = objToKvList(otherLaunchOptions);

    if (kvList.length > 0) {
      console.info(`[launch.*]`);
      console.table(kvList);
    }
  }

  if (defaultMastodonBaseUrl)
    console.info(`[defaultMastodonBaseUrl] ${defaultMastodonBaseUrl}`);

  if (syncList.length === 0) {
    console.info(`[syncList] empty`);
  } else {
    console.info(`[syncList] ${syncList.length} items`);
  console.table(
      syncList.map((s) => ({
        "weibo.userId": s.weibo.userId,
        "mastodon.baseUrl": s.mastodon.baseUrl,
        "mastodon.checkHistory": s.mastodon.checkHistory,
        "mastodon.accessToken": s.mastodon.accessToken ? "***" : "",
      }))
    );
  }

  const otherKv = objToKvList(otherConfigs);
  if (otherKv.length > 0) {
    console.info(`[...otherConfigs]`);
    console.table(otherKv);
  }
}

function objToKvList(obj: {}) {
  return Object.entries(obj).map(([key, value]) => ({
      key,
      value: typeof value === "object" && value ? JSON.stringify(value) : value,
  }));
}

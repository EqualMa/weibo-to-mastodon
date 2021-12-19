import { PuppeteerLib } from "./ctx";
import { OperationDelayOption } from "./delay";
import * as fsp from "fs/promises";

export interface SetupBrowserConfig {
  puppeteer: "puppeteer" | "puppeteer-core";
  launch: Parameters<PuppeteerLib["launch"]>[0] | undefined;
}

export type SetupBrowserConfigInput = Partial<SetupBrowserConfig>;

export interface SetupCtxConfig extends SetupBrowserConfig {
  /** default to `"random"` */
  delay: OperationDelayOption;
}

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

export async function resolveConfig(): Promise<WeiboToMastodonConfig> {
  const txt = await fsp.readFile(".w2mrc.json", "utf-8").catch((_err) => "");
  const json: WeiboToMastodonConfigInput = txt.trim() ? JSON.parse(txt) : {};
  //   TODO: validate

  const {
    //
    puppeteer = "puppeteer-core",
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
  console.info("Using WeiboToMastodonConfig:");
  console.table(
    Object.entries(config).map(([key, value]) => ({
      key,
      value: typeof value === "object" && value ? JSON.stringify(value) : value,
    }))
  );
}

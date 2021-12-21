import { OperationDelayOption } from "./delay";
import { SetupBrowserConfig } from "./browser";
import * as fsp from "fs/promises";

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

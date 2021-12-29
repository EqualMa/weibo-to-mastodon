#!/usr/bin/env node

import * as s from "../setup";
import { ensureLogin } from "../weibo/login";
import syncWeiboToMastodon from "../weibo/sync";

async function main() {
  const {
    //
    syncList,
    defaultMastodonBaseUrl,
    defaultWeiboLogin,
    ...config
  } = await s.resolveConfig();
  const globalCtx = await s.setupCtx(config);

  const syncs = syncList.map((s, i) => {
    const baseUrl = s.mastodon.baseUrl || defaultMastodonBaseUrl;
    if (!baseUrl) {
      throw new Error(
        `WeiboToMastodonConfig.syncList[${i}].baseUrl and defaultMastodonBaseUrl are both not set.`
      );
    }
    return {
      ...s,
      mastodon: {
        ...s.mastodon,
        baseUrl,
        checkHistory: s.mastodon.checkHistory ?? 10,
      },
    };
  });

  for (const [i, { weibo, mastodon }] of syncs.entries()) {
    const prefix = `[sync ${i}][WeiboUser ${weibo.userId}]`;
    console.log(`${prefix} [start] syncing into ${mastodon.baseUrl}`);
    const log = (text: string, data: unknown) => {
      console.log(...[`${prefix}${text}`, data].filter(Boolean));
    };
    try {
      const ctx = await s.setupWeiboUserPage({
        ...globalCtx,
        uid: weibo.userId,
      });

      if (defaultWeiboLogin) {
        const user = await ensureLogin(ctx);
        console.warn(
          `${prefix} [login] Logged in as ${user.screenName} successfully`
        );
      } else {
        console.warn(`${prefix} [login] skip login`);
      }

      await syncWeiboToMastodon({
        ctx,
        log,
        mastodon,
        stopAfterFailed: config.stopAfterFailed,
      });
    } catch (error) {
      console.error(`${prefix} [error]:`, error);
    }
  }

  if (config.launch?.headless !== false) {
    await globalCtx.browser.close();
  }
}

s.run(main);

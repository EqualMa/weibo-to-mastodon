import { getLatestWeiboListOfUser } from "./get";
import { WeiboUserPageContext } from "./setup";
import * as cheerio from "cheerio";

import generator, { Entity, Mastodon, MegalodonInterface } from "megalodon";
import { MBlog } from "./data";
import renderWeibo from "./render";
import MastodonAPI from "megalodon/lib/src/mastodon/api_client";

import { pipeline } from "stream/promises";
import * as fs from "fs";
import * as fsp from "fs/promises";

interface MetaData {
  uid: string;
  mblogid: string;
  createdAt: string;
}

export default async function syncWeiboToMastodon({
  ctx,
  mastodon,
  log,
  stopAfterFailed,
}: {
  ctx: WeiboUserPageContext;
  mastodon: {
    baseUrl: string;
    accessToken: string;
    checkHistory: number;
  };
  log: (event: string, data?: unknown) => void;
  stopAfterFailed: boolean;
}) {
  const weiboList = await getLatestWeiboListOfUser({ ctx });

  const client = generator("mastodon", mastodon.baseUrl, mastodon.accessToken);

  const account = (await client.verifyAccountCredentials()).data;
  log(
    `[step 0] logged in as @${account.username} (${account.display_name}) [${account.id}]`
  );

  const statuses = (
    await client.getAccountStatuses(account.id, {
      exclude_reblogs: true,
      exclude_replies: true,
      limit: mastodon.checkHistory,
    })
  ).data;

  interface SyncedData {
    status: Entity.Status;
    createdAt: number;
    uid?: string;
    id?: string;
  }

  const synced = statuses
    .map((s): SyncedData | null => {
      // const type = (s as any).content_type;
      // if (type !== "text/html") return null;

      const $ = cheerio.load(s.content);

      const el = $("a.w2m-weibo__original__time").first();
      const dtStr = el.attr("title");
      const link = el.attr("href");

      const m = link?.match(/weibo\.com\/([^\/]+)\/([^\/?#]+)/);

      const dt = dtStr ? new Date(dtStr).getTime() : NaN;

      if (isNaN(dt)) return null;
      return {
        status: s,
        createdAt: dt,
        uid: m?.[1],
        id: m?.[2],
      };
    })
    .filter((d): d is SyncedData => d?.uid === ctx.uid);

  const syncedIdMap = new Map(
    synced.filter((d) => !!d.id).map((d) => [d.id!, d])
  );

  const lastSynced = synced.reduce<SyncedData | null>(
    (p, v) => (!p || v.createdAt > p.createdAt ? v : p),
    null
  );

  log(
    `[step 1] find last synced weibo from the latest ${
      mastodon.checkHistory
    } history statuses: ${
      lastSynced
        ? `https://weibo.com/${lastSynced.uid}/${lastSynced.id} [${new Date(
            lastSynced.createdAt
          ).toISOString()}] synced by ${lastSynced.status.url} [${
            lastSynced.status.created_at
          }]`
        : "null"
    }`
  );

  log(`[step 2][start] syncing weibo to mastodon`);

  const total = weiboList.length;

  for (const [i, w] of weiboList.entries()) {
    const prefix = `[step 2][${i + 1}/${total}] `;
    const synced = syncedIdMap.get(w.id);
    if (synced) {
      log(`${prefix}[skip] ${w.url} already synced by ${synced.status.url}`);
    } else if (lastSynced && w.createdAt.getTime() <= lastSynced.createdAt) {
      log(
        `${prefix}[skip] ${
          w.url
        } is created at [${w.createdAt.toISOString()}], before \
https://weibo.com/${lastSynced.uid}/${lastSynced.id} \
(${new Date(lastSynced.createdAt).toISOString()}, \
synced by ${lastSynced.status.url})`
      );
    } else {
      try {
        const status = await syncOneWeibo({ weibo: w, client });
        log(`${prefix}[done] successfully synced ${w.url} to ${status.url}`);
      } catch (error) {
        log(`${prefix}[error] failed to sync ${w.url} :`, error);
        if (stopAfterFailed) {
          log(`stopped after failed`);
          break;
        }
      }
    }
  }
}

async function postHtmlStatus(
  client: MegalodonInterface,
  html: string,
  options?: any
) {
  const params = {
    ...options,
    status: html,
    content_type: "text/html",
  };

  const api = (client as Mastodon).client;

  return api
    .post<MastodonAPI.Entity.Status>("/api/v1/statuses", params)
    .then((res) => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data),
      });
    });
}

async function syncOneWeibo({
  //
  weibo,
  client,
}: {
  weibo: MBlog;
  client: MegalodonInterface;
}): Promise<Entity.Status> {
  const images = weibo.content.images;
  const maxAttachments = 4;

  const uploaded: Entity.Attachment[] = [];

  if (images.length > 0) {
    // TODO: not transform dynamic import
    // const m: typeof import("got") = await eval(`import("got")`);
    const m = await import("got");
    const got = m.default;
    for (const [i, image] of images.slice(0, maxAttachments).entries()) {
      // TODO: cache
      const dir = `.images/${weibo.id}`;
      await fsp.mkdir(dir, { recursive: true });

      const file = `${dir}/${i}.png`;

      const s = got.stream(image.url);
      await pipeline(s, fs.createWriteStream(file));
      const read = fs.createReadStream(file);

      const attachment = (await client.uploadMedia(read)).data;

      uploaded.push(attachment);
    }
  }

  const html = renderWeibo(weibo, {
    shouldSeeAllImagesAtOriginalLink:
      uploaded.length < images.length
        ? uploaded.length === 0
          ? true
          : "partially-shown"
        : false,
  });

  const resp = await postHtmlStatus(client, html, {
    content_type: "text/html",
    // visibility: "private",
    media_ids: uploaded.map((a) => a.id),
  });

  return resp.data;
}

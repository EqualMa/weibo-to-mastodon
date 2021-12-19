import * as input from "./input";
import * as uu from "./url";

export class User {
  id: string;
  domain: string;
  screenName: string;

  get url(): string {
    return uu.user(this.id);
  }

  constructor(input: input.User) {
    this.id = String(input.id);
    this.domain = input.domain;
    this.screenName = input.screen_name;
  }
}

export type MBlogBlock =
  | { type: "text"; textRaw: string }
  | {
      type: "topic";
      textRaw: string;
      /** text without starting and ending hash */
      title: string;
      url: string;
    }
  | { type: "emoticon"; textRaw: string; imageSrc: string }
  | {
      type: "url";
      textRaw: string;
      iconType: string | null;
      iconSrc: string | null;
      href: string;
      content: string;
    }
  | never;

export interface MBlogImage {
  url: string;
}

export interface MediaCard {
  type: string;
  pageId: string;
  shortUrl: string;
  title: string;
}

export class MBlogContent {
  textRaw: string;
  blocks: MBlogBlock[];

  images: MBlogImage[];

  retweeted: MBlog | null;

  mediaCard: MediaCard | null;

  constructor({
    textRaw,
    blocks,
    images,
    retweeted,
    mediaCard,
  }: {
    textRaw: string;
    blocks: MBlogBlock[];
    images: MBlogImage[];
    retweeted: MBlog | null;
    mediaCard: MediaCard | null;
  }) {
    this.textRaw = textRaw;
    this.blocks = blocks;
    this.images = images;
    this.retweeted = retweeted;
    this.mediaCard = mediaCard;
  }

  static fromInput({
    textRaw,
    topicStructs,
    retweeted,
    urlStructs,
    pics,
    pageInfo,
  }: {
    textRaw: string;
    topicStructs: input.TopicStruct[];
    urlStructs: input.UrlStruct[];
    pics: input.PicInfo[];
    retweeted: MBlog | null;
    pageInfo: input.PageInfo | null;
  }) {
    const images = pics.map((pic): MBlogImage => ({ url: pic.largest.url }));
    const bs: { block: MBlogBlock; pos: [number, number] }[] = [];

    let mediaCard: MediaCard | null = null;

    if (pageInfo) {
      const u = urlStructs.find((u) => u.page_id === pageInfo.page_id);
      if (u) {
        mediaCard = {
          pageId: u.page_id,
          shortUrl: u.short_url,
          type: pageInfo.object_type,
          title: u.url_title,
        };
      }
    }

    for (const topic of topicStructs) {
      const title = topic.topic_title;
      const t = `#${title}#`;
      const start = textRaw.indexOf(t);
      if (start !== -1) {
        bs.push({
          block: { type: "topic", textRaw: t, title, url: uu.topic(title) },
          pos: [start, start + t.length],
        });
      }
    }

    for (const u of urlStructs) {
      const url = u.short_url;
      const start = textRaw.indexOf(url);

      if (start !== -1) {
        const iconType = u.url_type_pic.match(/_([^\._]+)\.png$/)?.[1] || "web";

        bs.push({
          block: {
            type: "url",
            iconType,
            textRaw: url,
            href: url,
            content: u.url_title,
            iconSrc: uu.icon(iconType),
          },
          pos: [start, start + url.length],
        });
      }
    }

    const all = textRaw.matchAll(/\[[^\[\]\s]+\]/g);

    for (const m of all) {
      const start = m.index;
      if (typeof start === "number") {
        const emo = m[0];
        bs.push({
          block: { type: "emoticon", textRaw: emo, imageSrc: uu.emoticon(emo) },
          pos: [start, start + emo.length],
        });
      }
    }

    bs.sort((a, b) => a.pos[0] - b.pos[0]);

    if (bs.length === 0 || bs[0].pos[0] > 0) {
      const end = bs[0] ? bs[0].pos[0] : textRaw.length;
      const t = textRaw.slice(0, end);
      bs.splice(0, 0, {
        block: { type: "text", textRaw: t },
        pos: [0, end],
      });
    }

    const blocks = bs.flatMap((v, i, arr): MBlogBlock[] => {
      const next = arr[i + 1];

      const nextStart = next ? next.pos[0] : textRaw.length;

      if (v.pos[1] < nextStart) {
        const inter: MBlogBlock = {
          type: "text",
          textRaw: textRaw.slice(v.pos[1], nextStart),
        };
        return [v.block, inter];
      } else {
        return [v.block];
      }
    });

    return new MBlogContent({
      textRaw,
      retweeted,
      blocks,
      images,
      mediaCard,
    });
  }

  get mainLink(): { url: string; title: string } | null {
    if (this.retweeted) {
      return {
        url: this.retweeted.url,
        title: `转发 @${this.retweeted.user.screenName} 的微博`,
      };
    } else if (this.mediaCard) {
      return { url: this.mediaCard.shortUrl, title: this.mediaCard.title };
    } else {
      return null;
    }
  }
}

export class MBlog {
  /** mblogid */
  id: string;
  isTop: boolean;

  content: MBlogContent;

  createdAt: Date;

  user: User;

  originalData: input.MBlog;

  get url(): string {
    return `https://weibo.com/${this.user.id}/${this.id}`;
  }

  constructor(data: {
    id: string;
    isTop: boolean;
    createdAt: Date;
    user: User;
    content: MBlogContent;
    originalData: input.MBlog;
  }) {
    this.id = data.id;
    this.isTop = data.isTop;
    this.createdAt = data.createdAt;
    this.user = data.user;
    this.content = data.content;
    this.originalData = data.originalData;
  }

  static fromInput(inputData: input.MBlog): MBlog {
    const retweeted = inputData.retweeted_status
      ? this.fromInput(inputData.retweeted_status)
      : null;
    return new MBlog({
      id: inputData.mblogid,
      createdAt: new Date(inputData.created_at),
      content: MBlogContent.fromInput({
        textRaw: inputData.text_raw,
        pics: inputData.pic_ids.map((pid) => inputData.pic_infos?.[pid]!),
        topicStructs: inputData.topic_struct || [],
        urlStructs: inputData.url_struct || [],
        retweeted,
        pageInfo: inputData.page_info ?? null,
      }),
      isTop: inputData.isTop === 1,
      user: new User(inputData.user),
      originalData: inputData,
    });
  }
}

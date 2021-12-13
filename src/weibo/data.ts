import * as input from "./input";

export class User {
  id: number;
  domain: string;
  screenName: string;

  constructor(input: input.User) {
    this.id = input.id;
    this.domain = input.domain;
    this.screenName = input.screen_name;
  }
}

export type MBlogBlock =
  | { type: "text"; textRaw: string }
  | { type: "topic"; textRaw: string }
  | { type: "emoticon"; textRaw: string }
  | never;

export class MBlog {
  /** mblogid */
  id: string;
  isTop: boolean;
  textRaw: string;

  createdAt: Date;

  user: User;

  get url(): string {
    return `https://weibo.com/${this.user.id}/${this.id}`;
  }

  constructor(data: {
    id: string;
    isTop: boolean;
    textRaw: string;
    createdAt: Date;
    user: User;
  }) {
    this.id = data.id;
    this.isTop = data.isTop;
    this.textRaw = data.textRaw;
    this.createdAt = data.createdAt;
    this.user = data.user;
  }
}

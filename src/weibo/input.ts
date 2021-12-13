export interface TopicStruct {}

export interface PicInfo {
  largest: {
    url: string;
  };
}

export interface RetweetedStatus {}

export interface User {
  avatar_hd: string;
  avatar_large: string;
  /** ascii id */
  domain: string;
  id: number;
  /** String(id) */
  idstr: string;
  /** /u/${id} */
  profile_url: string;
  screen_name: string;
}

export interface MBlog {
  /** 是否是长微博。如果是，则需要另外获取全文 */
  isLongText: boolean;
  created_at: string;
  mblogid: string;
  /** 是否是置顶微博 */
  isTop?: 1;
  /** text html */
  text: string;
  text_raw: string;
  topic_struct?: TopicStruct[];
  pic_ids: string[];
  /** pic_id to info */
  pic_infos?: Record<string, PicInfo>;
  retweeted_status?: MBlog;
  user: User;
}

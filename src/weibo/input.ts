export interface TopicStruct {
  /** text without starting and ending hash */
  topic_title: string;
}

export interface UrlStruct {
  url_title: string;
  short_url: string;
  long_url: string;
  url_type: number;
  url_type_pic: string;
  page_id: string;
  object_type: "place" | "" | (string & {});
}

export interface PicInfo {
  largest: {
    url: string;
  };
}

export interface User {
  avatar_hd: string;
  avatar_large: string;
  /** ascii id, may changed by user */
  domain: string;
  id: number;
  /** String(id) */
  idstr: string;
  /** /u/${id} */
  profile_url: string;
  screen_name: string;
}

export interface PageInfo {
  page_id: string;
  object_type: "video" | "article" | (string & {});
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
  url_struct?: UrlStruct[];
  pic_ids?: string[];
  /** pic_id to info */
  pic_infos?: Record<string, PicInfo>;
  retweeted_status?: MBlog;
  user: User;
  page_info?: PageInfo;
}

export interface LongMBlog {
  longTextContent: string;
  topic_struct?: TopicStruct[];
  url_struct?: UrlStruct[];
}

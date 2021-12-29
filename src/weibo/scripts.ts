import type * as ip from "./input";

export async function getBlogs({
  uid,
  page,
}: {
  uid: string;
  page: number;
}): Promise<ip.MBlog[]> {
  /** uid/mblogid to data */
  const blogs = new Map<string, ip.MBlog>();

  const xsrf = (window as any).$cookies.get("XSRF-TOKEN");
  const commonHeaders = {
    accept: "application/json, text/plain, */*",
    "accept-language": "zh,zh-CN;q=0.9,en;q=0.8",
    "x-requested-with": "XMLHttpRequest",
    "x-xsrf-token": xsrf,
  };

  const url = `https://weibo.com/ajax/statuses/mymblog?uid=${uid}&page=${page}&feature=0`;

  const resp = await fetch(url, {
    headers: commonHeaders,
    referrer: `https://weibo.com/u/${uid}`,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  });

  const res: { ok: number; data: { list: ip.MBlog[] } } = await resp.json();

  if (res.ok !== 1) {
    throw new Error(
      `fetch ${url} ok=${res.ok} resp.body=${JSON.stringify(res)}`
    );
  }

  async function needToReFetch(m: ip.MBlog) {
    return Boolean(
      //
      m.pic_ids && !m.pic_ids.every((pid) => m?.pic_infos?.[pid])
    );
  }

  async function fetchOneBlogInfo(m: ip.MBlog): Promise<ip.MBlog> {
    const url = `https://weibo.com/ajax/statuses/show?id=${m.mblogid}`;
    const resp = await fetch(url, {
      headers: commonHeaders,
      referrer: `https://weibo.com/${m.user.id}/${m.mblogid}`,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`failed to get mblog info: ${url} ${txt}`);
    } else {
      const full: ip.MBlog = await resp.json();

      return full;
    }
  }

  async function getFullBlogInfo(m: ip.MBlog): Promise<ip.MBlog> {
    const key = `${m.user.id}/${m.mblogid}`;
    const value = blogs.get(key);
    if (value) {
      return value;
    }

    if (await needToReFetch(m)) {
      m = await fetchOneBlogInfo(m);
    }

    if (m.isLongText) {
      const data = await getLongTextInfo(m);

      m = {
        ...m,
        text_raw: data.longTextContent,
        topic_struct: data.topic_struct,
        url_struct: data.url_struct,
      };
    }

    if (m.retweeted_status) {
      m = {
        ...m,
        retweeted_status: await getFullBlogInfo(m.retweeted_status),
      };
    }

    blogs.set(key, m);

    return m;
  }

  async function getLongTextInfo(m: ip.MBlog): Promise<ip.LongMBlog> {
    const resp = await fetch(
      `https://weibo.com/ajax/statuses/longtext?id=${m.mblogid}`,
      {
        headers: commonHeaders,
        referrer: `https://weibo.com/u/${uid}`,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );

    const res: { ok: number; data: ip.LongMBlog } = await resp.json();
    const { ok, data } = res;

    if (ok !== 1) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`failed to load full content: ${url} ${txt}`);
    }

    return data;
  }

  const inputBlogs = await Promise.all(
    res.data.list.map((m) => getFullBlogInfo(m))
  );

  return inputBlogs;
}

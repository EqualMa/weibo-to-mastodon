import type * as ip from "./input";

export async function getBlogs({
  uid,
  page,
}: {
  uid: string;
  page: number;
}): Promise<ip.MBlog[]> {
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

  async function getFullBlogInfo(m: ip.MBlog) {
    if (!m.isLongText) return m;

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
      // throw new Error(`fetch ${url} ok=${ok}`);
      console.error(`failed to load full context: ${url}`, res);
      return m;
    }

    return {
      ...m,
      text_raw: data.longTextContent,
      topic_struct: data.topic_struct,
      url_struct: data.url_struct,
    };
  }

  const inputBlogs = await Promise.all(
    res.data.list.map(async (m) => {
      const info = await getFullBlogInfo(m);
      const rt = info.retweeted_status;
      if (rt) {
        if (rt.isLongText) {
          info.retweeted_status = await getFullBlogInfo(rt);
        } else {
          const url = `https://weibo.com/ajax/statuses/show?id=${rt.mblogid}`;
          const resp = await fetch(url, {
            headers: commonHeaders,
            referrer: `https://weibo.com/${rt.user.id}/${rt.mblogid}`,
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "include",
          });

          if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            console.error(`failed to get mblog info: ${url}`, txt);
          } else {
            const full: ip.MBlog = await resp.json();

            info.retweeted_status = full;
          }
        }
      }

      return info;
    })
  );

  return inputBlogs;
}

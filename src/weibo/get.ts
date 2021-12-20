import * as s from "./scripts";
import * as d from "./data";
import { WeiboUserPageContext } from "./setup";

async function getWeiboListPageOfUser({
  ctx,
  uid,
  page,
}: {
  ctx: WeiboUserPageContext;
  uid: string;
  /** starting from 0 */
  page: number;
}): Promise<d.MBlog[]> {
  const inputBlogs = await ctx.page.evaluate(s.getBlogs, { uid, page });

  return inputBlogs.map((b) => d.MBlog.fromInput(b));
}

export async function getLatestWeiboListOfUser({
  ctx,
  limit = 10,
}: {
  ctx: WeiboUserPageContext;
  limit?: number;
}): Promise<d.MBlog[]> {
  const { uid } = ctx;

  if (limit !== 10) {
    throw new Error(`Currently only support limit = 10`);
  }
  const list = await getWeiboListPageOfUser({ ctx, uid, page: 1 });

  list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  if (list.length > limit) {
    return list.slice(list.length - limit);
  } else {
    return list;
  }
}

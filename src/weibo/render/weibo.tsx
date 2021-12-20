import { MBlog } from "../data";
import Block from "./block";
import * as lx from "luxon";

export default function Weibo({
  weibo,
  shouldSeeAllImagesAtOriginalLink,
}: {
  weibo: MBlog;
  shouldSeeAllImagesAtOriginalLink?: "partially-shown" | boolean;
}) {
  const isoCreatedAt = weibo.createdAt.toISOString();
  const displayCreatedAt = lx.DateTime.fromJSDate(weibo.createdAt)
    .setZone("UTC+8")
    .toFormat("yyyy-LL-dd TTT");

  const mainLink = weibo.content.mainLink;

  return (
    <article
      className={`w2m-weibo w2m-weibo--user-${weibo.user.id} w2m-weibo--mblog-${weibo.id}`}
    >
      <div className="w2m-weibo__original">
        {/* make sure mastodon generate the correct media card */}
        <a
          href={mainLink ? mainLink.url : weibo.url}
          className="w2m-weibo__original__main-link"
          target="_blank"
          rel="noopener noreferrer"
          hidden
        />
        <a
          href={weibo.user.url}
          className="w2m-weibo__original__user"
          target="_blank"
          rel="noopener noreferrer"
        >
          {weibo.user.screenName}
        </a>
        <br />
        <a
          href={weibo.url}
          className="w2m-weibo__original__time"
          title={weibo.createdAt.toISOString()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <time
            dateTime={isoCreatedAt}
            itemProp="datePublished"
            {...{ pubdate: "" }}
          >
            {displayCreatedAt}
          </time>
        </a>
      </div>
      <div className="w2m-weibo__content">
        {weibo.content.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
      {shouldSeeAllImagesAtOriginalLink && weibo.content.images.length > 0 ? (
        <div className="w2m-weibo__tip-all-images">
          在
          <a
            className="w2m-weibo__tip-all-images__link"
            href={weibo.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            原微博
          </a>
          查看
          {shouldSeeAllImagesAtOriginalLink === "partially-shown"
            ? "全部"
            : null}{" "}
          {weibo.content.images.length} 张图片
        </div>
      ) : null}
      {weibo.content.retweeted ? (
        <blockquote
          cite={weibo.content.retweeted.url}
          className="w2m-weibo__retweet"
        >
          <Weibo
            weibo={weibo.content.retweeted}
            shouldSeeAllImagesAtOriginalLink
          />
        </blockquote>
      ) : null}
    </article>
  );
}

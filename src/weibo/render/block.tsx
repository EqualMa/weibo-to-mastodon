import * as React from "react";
import { MBlogBlock } from "../data";

export default function Block({ block }: { block: MBlogBlock }) {
  switch (block.type) {
    case "topic":
      return (
        <a
          href={block.url}
          className="w2m-weibo__content__topic"
          target="_blank"
          rel="noopener noreferrer"
        >
          {block.textRaw}
        </a>
      );
    case "emoticon":
      return (
        <img
          className="w2m-weibo__content__emoticon"
          src={block.imageSrc}
          alt={block.textRaw}
          title={block.textRaw}
          style={{ height: "1em" }}
        />
      );
    case "url":
      return (
        <a
          href={block.href}
          className="w2m-weibo__content__url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {block.iconSrc ? (
            <img
              className="w2m-weibo__content__url__icon"
              src={block.iconSrc}
              alt={block.content}
              style={{ height: "1em" }}
            />
          ) : null}
          {block.content}
        </a>
      );
    case "text":
      if (!block.textRaw.includes("\n")) {
        return <>{block.textRaw}</>;
      } else {
        const all = block.textRaw.split("\n");
        const last = all[all.length - 1];
        return (
          <>
            {all.slice(0, -1).map((t, i) => (
              <React.Fragment key={i}>
                {t}
                <br />
              </React.Fragment>
            ))}
            {last}
          </>
        );
      }
    default:
      throw new Error(`Unknown WeiboContentBlock ${JSON.stringify(block)}`);
  }
}

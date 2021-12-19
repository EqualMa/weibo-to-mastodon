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
            />
          ) : null}
          {block.content}
        </a>
      );
    default:
      return <>{block.textRaw}</>;
  }
}

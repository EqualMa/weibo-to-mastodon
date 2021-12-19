import { MBlog } from "../data";
import Weibo from "./weibo";
import { renderToStaticMarkup } from "react-dom/server";

export default function renderWeibo(
  weibo: MBlog,
  options: {
    shouldSeeAllImagesAtOriginalLink?: boolean | "partially-shown";
  } = {}
): string {
  const el = <Weibo weibo={weibo} {...options} />;
  return renderToStaticMarkup(el);
}

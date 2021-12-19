export function topic(topicTitle: string): string {
  const text = `#${topicTitle}#`;
  return `https://s.weibo.com/weibo?q=${encodeURIComponent(text)}`;
}

export function emoticon(emoticonTextRaw: string): string {
  const p = encodeURIComponent(emoticonTextRaw);
  return `https://weibo-emoji.vercel.app/emoticon/${p}`;
}

export function icon(iconType: string): string {
  return `https://weibo-emoji.vercel.app/icon/${iconType}.png`;
}

export function user(uid: string): string {
  return `https://weibo.com/u/${uid}`;
}

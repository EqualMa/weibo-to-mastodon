import * as s from "../src/setup";

s.run(async () => {
  const config = await s.resolveConfig();
  s.infoConfig(config);
  const browser = await s.setupBrowser(config);

  const page = await browser.newPage();
  await page.goto("https://example.com");

  const title = await page.title();

  console.log(`[success] https://example.com - ${title}`);

  await browser.close();
});

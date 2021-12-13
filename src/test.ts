import * as pp from "puppeteer";

(async () => {
  const browser = await pp.launch();
  const page = await browser.newPage();
  await page.goto("https://example.com");

  const title = await page.title();

  console.log(`[success] https://example.com - ${title}`);

  await browser.close();
})().catch((err) => {
  process.exitCode = 1;
  console.error(err);
});

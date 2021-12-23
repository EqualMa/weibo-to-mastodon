interface KnownPuppeteerLibs {
  // @ts-ignore
  puppeteer: typeof import("puppeteer");
  // @ts-ignore
  "puppeteer-core": typeof import("puppeteer-core");
}

export type PuppeteerModuleName = keyof KnownPuppeteerLibs;

export type CustomPuppeteerModuleName = PuppeteerModuleName | (string & {});

export type AvailablePuppeteerModuleName = {
  [K in PuppeteerModuleName]: any extends KnownPuppeteerLibs[K] ? never : K;
}[PuppeteerModuleName];

export type PuppeteerLib = KnownPuppeteerLibs[AvailablePuppeteerModuleName];

export type PuppeteerLaunchParam = Parameters<PuppeteerLib["launch"]>[0];

type ClassOfConstructor<T> = T extends { new (...args: any[]): infer R }
  ? R
  : never;

export type Browser = ClassOfConstructor<PuppeteerLib["Browser"]>;
export type Page = ClassOfConstructor<PuppeteerLib["Page"]>;

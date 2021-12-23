import run from "../src/run";
import * as fsp from "fs/promises";

run(async () => {
  await fsp.copyFile("package.json", "dist/package.json");
});

export default function run<T>(func: () => Promise<T>): Promise<T | void> {
  return func().catch((err) => {
    if (!process.exitCode) process.exitCode = 1;
    console.error(err);
  });
}

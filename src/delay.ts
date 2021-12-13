export type OperationDelayOption = number | boolean | "random";

export function getDelayFunc(
  option: OperationDelayOption
): () => Promise<void> {
  if (option === "random" || option === true) {
    return () =>
      new Promise((resolve) => {
        const t = (Math.random() + 1) / 2;
        setTimeout(resolve, t * 1000);
      });
  } else if (option && option > 0) {
    return () =>
      new Promise((resolve) => {
        setTimeout(resolve, option);
      });
  } else {
    return () => Promise.resolve();
  }
}

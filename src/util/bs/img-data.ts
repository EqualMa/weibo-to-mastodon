export default async function getImgData(img: HTMLImageElement): Promise<{
  binString: string;
  width: number;
  height: number;
}> {
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas has no 2d context");

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);

  const buf = imageData.data;
  const blob = new Blob([buf], { type: "application/octet-binary" });

  const binString = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      resolve(evt.target?.result as never);
    };
    reader.readAsBinaryString(blob);
  });

  return {
    binString,
    width,
    height,
  };
}

// Image Rendering and Download

export async function loadImage(url: string) {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.decoding = 'async'
  image.src = url
  await image.decode()
  return image
}
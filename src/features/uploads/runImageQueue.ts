import { preprocessImage } from './preprocessImage'

export type ProcessedImage = { file: File; blob: Blob }

export async function runImageQueue(
  files: File[],
  onProgress: (complete: number, total: number) => void,
): Promise<ProcessedImage[]> {
  const pending = files.filter((file) => file.type.startsWith('image/')).slice(0, 500)
  const results: ProcessedImage[] = new Array(pending.length)
  let cursor = 0
  let complete = 0

  // Share one cursor across four asynchronous workers.
  async function worker() {
    while (cursor < pending.length) {
      const index = cursor++
      results[index] = { file: pending[index], blob: await preprocessImage(pending[index]) }
      onProgress(++complete, pending.length)
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker))
  return results
}
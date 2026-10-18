import { describe, expect, it } from 'vite-plus/test'
import { initialDraft } from './draft'
import { renderStampPng } from './export'
import { STAMP_SIZE } from './fit'

/** PNG をデコードして RGBA を読む */
async function pixelsOf(blob: Blob) {
  const bitmap = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
  const alphaAt = (x: number, y: number) => data[(y * bitmap.width + x) * 4 + 3] ?? 0
  let painted = 0
  for (let i = 3; i < data.length; i += 4) if ((data[i] ?? 0) > 0) painted++
  return { width: bitmap.width, height: bitmap.height, alphaAt, painted }
}

describe('renderStampPng', () => {
  it('128×128 の PNG を返す', async () => {
    const blob = await renderStampPng({ ...initialDraft, text: 'おつ', background: '#ffffff' })

    expect(blob.type).toBe('image/png')
    const px = await pixelsOf(blob)
    expect([px.width, px.height]).toEqual([STAMP_SIZE, STAMP_SIZE])
    expect(px.painted).toBe(STAMP_SIZE * STAMP_SIZE)
  })

  it('背景が透明なら角は透明のまま、文字の分だけ塗られる', async () => {
    const blob = await renderStampPng({ ...initialDraft, text: 'おつ', background: null })

    const px = await pixelsOf(blob)
    expect(px.alphaAt(0, 0)).toBe(0)
    expect(px.painted).toBeGreaterThan(0)
    expect(px.painted).toBeLessThan(STAMP_SIZE * STAMP_SIZE)
  })

  it('size を指定するとその大きさで書き出す', async () => {
    const blob = await renderStampPng({ ...initialDraft, text: 'おつ' }, { size: 64 })

    const px = await pixelsOf(blob)
    expect([px.width, px.height]).toEqual([64, 64])
  })
})

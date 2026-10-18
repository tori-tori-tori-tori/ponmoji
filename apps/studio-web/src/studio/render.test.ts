import { describe, expect, it } from 'vite-plus/test'
import { initialDraft, type StampDraft } from './draft'
import { fitText, lineCenters, STAMP_SIZE } from './fit'
import { renderStamp, type StampContext } from './render'

/** 1 文字の幅が文字サイズと同じ(全角相当)の等幅フォントを模した偽コンテキスト */
function fakeContext() {
  const fills: { x: number; y: number; w: number; h: number; style: string }[] = []
  const texts: { text: string; x: number; y: number; font: string; style: string }[] = []
  // fillStyle は型上 CanvasGradient も取りうるが、この偽コンテキストでは文字列しか入れない
  const style = () => (typeof ctx.fillStyle === 'string' ? ctx.fillStyle : '')
  const ctx: StampContext = {
    font: '',
    fillStyle: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    fillRect(x, y, w, h) {
      fills.push({ x, y, w, h, style: style() })
    },
    measureText(text) {
      const fontSize = Number(/(\d+(?:\.\d+)?)px/.exec(ctx.font)?.[1] ?? 0)
      return { width: Array.from(text).length * fontSize }
    },
    fillText(text, x, y) {
      texts.push({ text, x, y, font: ctx.font, style: style() })
    },
  }
  return { ctx, fills, texts }
}

const measure = (text: string, fontSize: number) => Array.from(text).length * fontSize

describe('renderStamp', () => {
  it('背景色があれば全面を塗り、その上に文字を描く', () => {
    const { ctx, fills, texts } = fakeContext()
    const draft: StampDraft = { ...initialDraft, text: 'おつ', background: '#fff3b0' }

    renderStamp(ctx, draft)

    expect(fills).toEqual([{ x: 0, y: 0, w: STAMP_SIZE, h: STAMP_SIZE, style: '#fff3b0' }])
    expect(texts.map((t) => t.text)).toEqual(['おつ'])
  })

  it('背景が透明なら何も塗らない(下地は呼び出し側の責務)', () => {
    const { ctx, fills } = fakeContext()

    renderStamp(ctx, { ...initialDraft, text: 'おつ', background: null })

    expect(fills).toEqual([])
  })

  it('fitText と同じ文字サイズで、各行を中央揃えで描く', () => {
    const { ctx, texts } = fakeContext()
    const draft: StampDraft = { ...initialDraft, text: 'おつ\nかれさま', textColor: '#102030' }

    const result = renderStamp(ctx, draft)

    const expected = fitText({ text: draft.text, measure })
    expect(result).toEqual(expected)
    expect(texts.map((t) => t.text)).toEqual(['おつ', 'かれさま'])
    expect(texts.map((t) => t.x)).toEqual([STAMP_SIZE / 2, STAMP_SIZE / 2])
    expect(texts.map((t) => t.y)).toEqual(lineCenters(expected))
    expect(texts.every((t) => t.font.includes(`${expected.fontSize}px`))).toBe(true)
    expect(texts.every((t) => t.style === '#102030')).toBe(true)
    expect(ctx.textAlign).toBe('center')
    expect(ctx.textBaseline).toBe('middle')
  })

  it('size を変えると背景と文字位置がそのサイズ基準になる', () => {
    const { ctx, fills, texts } = fakeContext()

    renderStamp(ctx, { ...initialDraft, text: 'おつ', background: '#ffffff' }, { size: 64 })

    expect(fills[0]).toMatchObject({ w: 64, h: 64 })
    expect(texts[0]).toMatchObject({ x: 32, y: 32 })
  })
})

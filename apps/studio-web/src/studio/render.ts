import type { StampDraft } from './draft'
import { fitText, type FitResult, lineCenters, STAMP_SIZE } from './fit'
import { findFont } from './fonts'

/**
 * スタンプを 2D コンテキストに描く。React・DOM・キャンバスの生成に依存しない。
 * 編集プレビュー、実寸プレビュー、PNG 書き出し、将来のサーバー描画が同じ結果を使う。
 */

/** 描画に使うコンテキストの最小集合。CanvasRenderingContext2D / OffscreenCanvasRenderingContext2D の両方が満たす */
export type StampContext = {
  font: string
  fillStyle: string | CanvasGradient | CanvasPattern
  textAlign: CanvasTextAlign
  textBaseline: CanvasTextBaseline
  fillRect(x: number, y: number, w: number, h: number): void
  measureText(text: string): { width: number }
  fillText(text: string, x: number, y: number): void
}

export type RenderOptions = {
  /** キャンバスの一辺(px)。描画座標はこのサイズ基準 */
  size?: number
}

/** フォント指定の CSS 文字列。計測・描画・`document.fonts.load` で同じ文字列を使う */
export function fontCss(family: string, fontSize: number): string {
  return `700 ${fontSize}px "${family}", sans-serif`
}

/**
 * 背景色(あれば)と文字を描く。キャンバスの初期化(クリアや透明時の下地)は呼び出し側が行う。
 * 戻り値は文字のフィット結果で、UI の表示に使う。
 */
export function renderStamp(
  ctx: StampContext,
  draft: StampDraft,
  { size = STAMP_SIZE }: RenderOptions = {},
): FitResult {
  const font = findFont(draft.fontId)

  if (draft.background) {
    ctx.fillStyle = draft.background
    ctx.fillRect(0, 0, size, size)
  }

  const result = fitText({
    text: draft.text,
    size,
    measure: (text, fontSize) => {
      ctx.font = fontCss(font.family, fontSize)
      return ctx.measureText(text).width
    },
  })

  ctx.font = fontCss(font.family, result.fontSize)
  ctx.fillStyle = draft.textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const centers = lineCenters(result, size)
  result.lines.forEach((line, i) => {
    ctx.fillText(line, size / 2, centers[i] ?? size / 2)
  })

  return result
}

/**
 * テキストを正方形のキャンバスに収めるための文字サイズを決める。
 * 描画ライブラリに依存しない純粋な計算。幅の計測は呼び出し側から渡す。
 */

/** `fontSize` px で `text` を描いたときの幅(px)を返す関数 */
export type MeasureWidth = (text: string, fontSize: number) => number

export type FitOptions = {
  /** 改行を含む入力テキスト */
  text: string
  measure: MeasureWidth
  /** キャンバスの一辺(px) */
  size?: number
  /** 上下左右の余白(px) */
  padding?: number
  /** 行間。文字サイズに対する比率 */
  lineHeight?: number
  /** これ以上は縮めない文字サイズ(px) */
  minFontSize?: number
  /** これ以上は大きくしない文字サイズ(px) */
  maxFontSize?: number
}

export type FitResult = {
  lines: string[]
  fontSize: number
  lineHeight: number
  /** 下限の文字サイズでも収まらないとき false */
  fits: boolean
}

export const STAMP_SIZE = 128
export const STAMP_PADDING = 8
export const DEFAULT_LINE_HEIGHT = 1.1
export const MIN_FONT_SIZE = 12

/** 幅の計測に使う基準サイズ。幅は文字サイズに比例するので 1 回の計測で済ませる */
const PROBE_FONT_SIZE = 100

export function splitLines(text: string): string[] {
  return text.replace(/\r\n?/g, '\n').split('\n')
}

export function fitText({
  text,
  measure,
  size = STAMP_SIZE,
  padding = STAMP_PADDING,
  lineHeight = DEFAULT_LINE_HEIGHT,
  minFontSize = MIN_FONT_SIZE,
  maxFontSize = size,
}: FitOptions): FitResult {
  const lines = splitLines(text)
  const inner = size - padding * 2

  // 幅の制約: いちばん長い行が inner に収まる文字サイズ
  const widestPerPx = Math.max(
    ...lines.map((line) => measure(line, PROBE_FONT_SIZE) / PROBE_FONT_SIZE),
  )
  const byWidth = widestPerPx > 0 ? inner / widestPerPx : maxFontSize

  // 高さの制約: 行数 × 行間 が inner に収まる文字サイズ
  const byHeight = inner / (lines.length * lineHeight)

  const ideal = Math.min(byWidth, byHeight, maxFontSize)
  const fontSize = Math.max(Math.floor(ideal), minFontSize)

  return {
    lines,
    fontSize,
    lineHeight,
    fits: ideal >= minFontSize,
  }
}

/** 各行の中心 y 座標(px)。テキストブロック全体をキャンバスの中央に置く */
export function lineCenters(result: FitResult, size = STAMP_SIZE): number[] {
  const step = result.fontSize * result.lineHeight
  const total = step * result.lines.length
  const top = (size - total) / 2
  return result.lines.map((_, i) => top + step * (i + 0.5))
}

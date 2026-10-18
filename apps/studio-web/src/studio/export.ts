import type { StampDraft } from './draft'
import { STAMP_SIZE } from './fit'
import { findFont } from './fonts'
import { fontCss, renderStamp } from './render'

/**
 * スタンプを PNG に書き出す。画面外のキャンバスに `renderStamp` で描くので、プレビューと同じ絵になる。
 */

export type ExportOptions = {
  /** 出力の一辺(px)。Slack / Discord / Teams とも 128 で受け付ける */
  size?: number
}

export async function renderStampPng(
  draft: StampDraft,
  { size = STAMP_SIZE }: ExportOptions = {},
): Promise<Blob> {
  // フォント未読み込みだとフォールバック書体で書き出してしまうので、先に読み込みを待つ。
  // 取得できない環境(オフライン、テスト)ではフォールバック書体で続行する
  try {
    await document.fonts.load(fontCss(findFont(draft.fontId).family, 32))
  } catch {
    // 続行
  }

  const canvas = new OffscreenCanvas(size, size)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D コンテキストを取得できませんでした')
  renderStamp(ctx, draft, { size })
  return canvas.convertToBlob({ type: 'image/png' })
}

const FILE_NAME_MAX_CHARS = 32
/** 制御文字(\p{Cc})と、主要 OS でファイル名に使えない記号 */
const FORBIDDEN_IN_FILE_NAME = /[\p{Cc}/\\:*?"<>|]/gu

/** テキストから PNG のファイル名を作る。空や記号だけなら `stamp.png` */
export function stampFileName(text: string): string {
  // 改行は制御文字でもあるので、先に空白類をまとめてハイフンにしてから禁止文字を消す
  const slug = Array.from(
    text
      .replace(/\s+/g, '-')
      .replace(FORBIDDEN_IN_FILE_NAME, '')
      .replace(/^[-.]+|[-.]+$/g, ''),
  )
    .slice(0, FILE_NAME_MAX_CHARS)
    .join('')
  return `${slug || 'stamp'}.png`
}

/** Blob をブラウザにダウンロードさせる */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

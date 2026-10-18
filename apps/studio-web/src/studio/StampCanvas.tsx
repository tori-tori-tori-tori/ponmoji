import { useEffect, useRef } from 'react'
import type { StampDraft } from './draft'
import { type FitResult, STAMP_SIZE } from './fit'
import { findFont } from './fonts'
import { fontCss, renderStamp } from './render'

type Props = {
  draft: StampDraft
  /** 画面上の表示サイズ(px)。描画は常に 128px 基準で行い、拡大縮小する */
  displaySize: number
  /** 背景が透明のときに敷く色。省略時は市松模様 */
  underlay?: string
  onFit?: (result: FitResult) => void
  className?: string
}

/** キャンバスを 128px 基準で描く。編集用と実寸の両方がこの 1 つの描画結果を使う */
export function StampCanvas({ draft, displaySize, underlay, onFit, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const font = findFont(draft.fontId)
    const dpr = window.devicePixelRatio || 1
    const scale = (displaySize / STAMP_SIZE) * dpr
    canvas.width = STAMP_SIZE * scale
    canvas.height = STAMP_SIZE * scale

    const draw = () => {
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.clearRect(0, 0, STAMP_SIZE, STAMP_SIZE)

      // 透明背景の下地はプレビューだけの演出。書き出しには含めない
      if (!draft.background) {
        if (underlay) {
          ctx.fillStyle = underlay
          ctx.fillRect(0, 0, STAMP_SIZE, STAMP_SIZE)
        } else {
          drawChecker(ctx)
        }
      }

      onFit?.(renderStamp(ctx, draft))
    }

    draw()
    // フォント読み込み前はフォールバック書体で描かれるので、読み込み後に描き直す
    let cancelled = false
    document.fonts
      .load(fontCss(font.family, 32))
      .then(() => {
        if (!cancelled) draw()
      })
      .catch(() => {
        // フォントが取得できなくてもフォールバック書体の描画は済んでいる
      })
    return () => {
      cancelled = true
    }
  }, [draft, displaySize, underlay, onFit])

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width: displaySize, height: displaySize }}
      aria-label="スタンプのプレビュー"
    />
  )
}

function drawChecker(ctx: CanvasRenderingContext2D) {
  const cell = 8
  for (let y = 0; y < STAMP_SIZE; y += cell) {
    for (let x = 0; x < STAMP_SIZE; x += cell) {
      ctx.fillStyle = ((x + y) / cell) % 2 === 0 ? '#e6e6e6' : '#ffffff'
      ctx.fillRect(x, y, cell, cell)
    }
  }
}

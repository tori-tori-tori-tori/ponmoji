import { useCallback, useMemo, useState } from 'react'
import { contrastRatio, MIN_CONTRAST } from './color'
import { clampText, initialDraft, MAX_CHARS_PER_LINE, MAX_LINES, type StampDraft } from './draft'
import { type FitResult, MIN_FONT_SIZE } from './fit'
import { STUDIO_FONTS } from './fonts'
import { StampCanvas } from './StampCanvas'
import { type Appearance, type Service, SERVICE_THEMES, SERVICES, textColorPresets } from './themes'

const EDIT_PREVIEW_SIZE = 384
const PLACEHOLDER = 'おつ'

export function Studio() {
  const [draft, setDraft] = useState<StampDraft>(initialDraft)
  const [service, setService] = useState<Service>('slack')
  const [appearance, setAppearance] = useState<Appearance>('light')
  const [fit, setFit] = useState<FitResult | null>(null)

  const theme = SERVICE_THEMES[service]
  const palette = theme[appearance]
  const update = (patch: Partial<StampDraft>) => setDraft((d) => ({ ...d, ...patch }))
  // 内容が同じなら state を更新しない。effect → onFit → setFit → 再レンダーの循環を止める
  const onFit = useCallback(
    (r: FitResult) => setFit((prev) => (prev && sameFit(prev, r) ? prev : r)),
    [],
  )

  // プレビューに描く内容。入力が空ならプレースホルダーを薄く出す(FR-04)。
  // StampCanvas の effect 依存に渡すので、毎レンダーで新しいオブジェクトにしない
  const shown = useMemo<StampDraft>(
    () => (draft.text ? draft : { ...draft, text: PLACEHOLDER, textColor: `${palette.muted}80` }),
    [draft, palette.muted],
  )

  const contrast = contrastRatio(draft.textColor, draft.background ?? palette.bg)
  const lowContrast = contrast < MIN_CONTRAST

  return (
    <div
      className="studio"
      data-service={service}
      data-appearance={appearance}
      style={{
        '--bg': palette.bg,
        '--surface': palette.surface,
        '--ink': palette.ink,
        '--muted': palette.muted,
        '--brand': theme.brand,
      }}
    >
      <header className="studio-header">
        <h1>ponmoji studio</h1>
        <div className="studio-theme" role="group" aria-label="テーマ">
          {SERVICES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={service === s}
              onClick={() => setService(s)}
            >
              {SERVICE_THEMES[s].label}
            </button>
          ))}
          <button
            type="button"
            aria-label={appearance === 'light' ? 'ダークにする' : 'ライトにする'}
            onClick={() => setAppearance((a) => (a === 'light' ? 'dark' : 'light'))}
          >
            {appearance === 'light' ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <div className="studio-body">
        <section className="studio-preview" aria-label="プレビュー">
          <StampCanvas
            draft={shown}
            displaySize={EDIT_PREVIEW_SIZE}
            onFit={onFit}
            className="studio-edit-canvas"
          />
          <p className="studio-fit">
            {fit && !fit.fits
              ? `文字サイズの下限（${MIN_FONT_SIZE}px）でも収まりません。文字数か行数を減らしてください`
              : fit
                ? `${fit.fontSize}px / ${fit.lines.length} 行`
                : ''}
          </p>

          <div className="studio-chat" aria-label={`${theme.label} での実寸`}>
            <span className="studio-avatar" aria-hidden="true" />
            <div>
              <div className="studio-chat-meta">
                <strong>ぽん</strong> <span>12:34</span>
              </div>
              <div className="studio-chat-line">
                おつかれさまです
                <StampCanvas draft={shown} displaySize={theme.emojiSize} underlay={palette.bg} />
              </div>
            </div>
          </div>
        </section>

        <section className="studio-controls">
          <label className="studio-field">
            <span>テキスト</span>
            <textarea
              value={draft.text}
              rows={MAX_LINES}
              placeholder={PLACEHOLDER}
              onChange={(e) => update({ text: clampText(e.target.value) })}
            />
            <small>
              1 行 {MAX_CHARS_PER_LINE} 文字 × {MAX_LINES} 行まで
            </small>
          </label>

          <fieldset className="studio-field">
            <legend>フォント</legend>
            {STUDIO_FONTS.map((f) => (
              <label
                key={f.id}
                className="studio-font"
                style={{ fontFamily: `"${f.family}", sans-serif` }}
              >
                <input
                  type="radio"
                  name="font"
                  value={f.id}
                  checked={draft.fontId === f.id}
                  onChange={() => update({ fontId: f.id })}
                />
                ぽんもじ <small>{f.label}</small>
              </label>
            ))}
          </fieldset>

          <fieldset className="studio-field">
            <legend>文字色</legend>
            <div className="studio-swatches">
              {textColorPresets(service, appearance).map((c) => (
                <button
                  key={c}
                  type="button"
                  className="studio-swatch"
                  style={{ background: c }}
                  aria-label={c}
                  aria-pressed={draft.textColor === c}
                  onClick={() => update({ textColor: c })}
                />
              ))}
              <input
                type="color"
                value={draft.textColor}
                aria-label="文字色を自由に選ぶ"
                onChange={(e) => update({ textColor: e.target.value })}
              />
            </div>
            {lowContrast && (
              <small className="studio-warn">
                背景とのコントラストが低めです（{contrast.toFixed(1)}
                :1）。チャット上で読みにくいかもしれません
              </small>
            )}
          </fieldset>

          <fieldset className="studio-field">
            <legend>背景色</legend>
            <div className="studio-swatches">
              <button
                type="button"
                className="studio-swatch studio-swatch-transparent"
                aria-label="透明"
                aria-pressed={draft.background === null}
                onClick={() => update({ background: null })}
              />
              {['#ffffff', '#000000', '#fff3b0', '#ffd6e0', '#d4f1f4', '#e0f5d8'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className="studio-swatch"
                  style={{ background: c }}
                  aria-label={c}
                  aria-pressed={draft.background === c}
                  onClick={() => update({ background: c })}
                />
              ))}
              <input
                type="color"
                value={draft.background ?? '#ffffff'}
                aria-label="背景色を自由に選ぶ"
                onChange={(e) => update({ background: e.target.value })}
              />
            </div>
          </fieldset>
        </section>
      </div>
    </div>
  )
}

function sameFit(a: FitResult, b: FitResult): boolean {
  return (
    a.fontSize === b.fontSize &&
    a.fits === b.fits &&
    a.lineHeight === b.lineHeight &&
    a.lines.length === b.lines.length &&
    a.lines.every((line, i) => line === b.lines[i])
  )
}

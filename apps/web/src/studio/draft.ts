import { DEFAULT_FONT_ID } from './fonts'

/** スタンプの内容。テーマは含めない(どのサービスでも同じ画像になるため) */
export type StampDraft = {
  text: string
  fontId: string
  textColor: string
  /** null は透明 */
  background: string | null
}

export const MAX_CHARS_PER_LINE = 8
export const MAX_LINES = 4

export const initialDraft: StampDraft = {
  text: '',
  fontId: DEFAULT_FONT_ID,
  textColor: '#1d1c1d',
  background: null,
}

/** 1 行あたりの文字数と行数の上限に切り詰める */
export function clampText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .slice(0, MAX_LINES)
    .map((line) => Array.from(line).slice(0, MAX_CHARS_PER_LINE).join(''))
    .join('\n')
}

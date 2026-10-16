/**
 * Studio で選べるフォント。すべて SIL Open Font License で、Google Fonts から配信する。
 * 候補の確定は要件定義 §10 の未決事項。
 */
export type StudioFont = {
  id: string
  label: string
  /** CSS の font-family に渡す名前 */
  family: string
  /** Google Fonts の family パラメータ */
  googleFamily: string
}

export const STUDIO_FONTS: readonly StudioFont[] = [
  {
    id: 'zen-maru-gothic',
    label: 'Zen Maru Gothic',
    family: 'Zen Maru Gothic',
    googleFamily: 'Zen+Maru+Gothic:wght@700',
  },
  {
    id: 'noto-sans-jp',
    label: 'Noto Sans JP',
    family: 'Noto Sans JP',
    googleFamily: 'Noto+Sans+JP:wght@700',
  },
  {
    id: 'm-plus-rounded',
    label: 'M PLUS Rounded 1c',
    family: 'M PLUS Rounded 1c',
    googleFamily: 'M+PLUS+Rounded+1c:wght@800',
  },
  {
    id: 'dela-gothic-one',
    label: 'Dela Gothic One',
    family: 'Dela Gothic One',
    googleFamily: 'Dela+Gothic+One',
  },
  {
    id: 'rocknroll-one',
    label: 'RocknRoll One',
    family: 'RocknRoll One',
    googleFamily: 'RocknRoll+One',
  },
  { id: 'reggae-one', label: 'Reggae One', family: 'Reggae One', googleFamily: 'Reggae+One' },
]

export const DEFAULT_FONT_ID = 'zen-maru-gothic'

export function findFont(id: string): StudioFont {
  return STUDIO_FONTS.find((f) => f.id === id) ?? STUDIO_FONTS[0]!
}

/** 全フォントを 1 本の <link> で読み込む URL(初期表示では text= で絞ってもよい) */
export function googleFontsHref(): string {
  const families = STUDIO_FONTS.map((f) => `family=${f.googleFamily}`).join('&')
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}

/**
 * 導入先サービスのテーマ。ponmoji は固有色を持たず、このテーマを着て見た目を切り替える。
 * 色は各サービスの UI を参考にした近似値。ブランドカラーのガイドライン確認は別途。
 */
export type Service = 'slack' | 'discord' | 'teams'
export type Appearance = 'light' | 'dark'

export type ServiceTheme = {
  label: string
  /** チャット上で絵文字が表示される一辺(px)。Discord は公式に 32。他は実機で要確認 */
  emojiSize: number
  brand: string
  light: { bg: string; surface: string; ink: string; muted: string }
  dark: { bg: string; surface: string; ink: string; muted: string }
}

export const SERVICE_THEMES: Record<Service, ServiceTheme> = {
  slack: {
    label: 'Slack',
    emojiSize: 22,
    brand: '#4a154b',
    light: { bg: '#ffffff', surface: '#f8f8f8', ink: '#1d1c1d', muted: '#616061' },
    dark: { bg: '#1a1d21', surface: '#222529', ink: '#d1d2d3', muted: '#ababad' },
  },
  discord: {
    label: 'Discord',
    emojiSize: 32,
    brand: '#5865f2',
    light: { bg: '#ffffff', surface: '#f2f3f5', ink: '#313338', muted: '#5c5e66' },
    dark: { bg: '#313338', surface: '#2b2d31', ink: '#dbdee1', muted: '#949ba4' },
  },
  teams: {
    label: 'Teams',
    emojiSize: 20,
    brand: '#5b5fc7',
    light: { bg: '#f5f5f5', surface: '#ffffff', ink: '#242424', muted: '#616161' },
    dark: { bg: '#1f1f1f', surface: '#292929', ink: '#ffffff', muted: '#adadad' },
  },
}

export const SERVICES: readonly Service[] = ['slack', 'discord', 'teams']

/** 文字色のプリセット。選択中テーマの ink / brand + 汎用色 */
export function textColorPresets(service: Service, appearance: Appearance): string[] {
  const t = SERVICE_THEMES[service]
  return [
    t[appearance].ink,
    t.brand,
    '#000000',
    '#ffffff',
    '#e53935',
    '#1e88e5',
    '#fdd835',
    '#43a047',
  ]
}

import { describe, expect, it } from 'vite-plus/test'
import { stampFileName } from './export'

describe('stampFileName', () => {
  it('テキストをそのままファイル名にする', () => {
    expect(stampFileName('おつ')).toBe('おつ.png')
  })
  it('改行と空白はハイフンにする', () => {
    expect(stampFileName('おつ\nかれ さま')).toBe('おつ-かれ-さま.png')
  })
  it('ファイル名に使えない記号は取り除く', () => {
    expect(stampFileName('a/b:c?')).toBe('abc.png')
  })
  it('空や記号だけなら stamp.png', () => {
    expect(stampFileName('')).toBe('stamp.png')
    expect(stampFileName('///')).toBe('stamp.png')
  })
  it('32 文字で切り詰める(サロゲートペアは 1 文字)', () => {
    expect(stampFileName('😀'.repeat(40))).toBe(`${'😀'.repeat(32)}.png`)
  })
})

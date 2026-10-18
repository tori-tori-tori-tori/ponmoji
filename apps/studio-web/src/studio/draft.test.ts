import { describe, expect, it } from 'vite-plus/test'
import { clampText } from './draft'

describe('clampText', () => {
  it('1 行 8 文字、4 行に切り詰める', () => {
    expect(clampText('123456789\nb\nc\nd\ne')).toBe('12345678\nb\nc\nd')
  })
  it('サロゲートペアを 1 文字として数える', () => {
    expect(clampText('😀'.repeat(9))).toBe('😀'.repeat(8))
  })
})

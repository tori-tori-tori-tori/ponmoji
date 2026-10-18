import { describe, expect, it } from 'vite-plus/test'
import { fitText, lineCenters, splitLines } from './fit'

// 1 文字の幅 = 文字サイズ(全角を想定した単純なモデル)
const squareMeasure = (text: string, fontSize: number) => text.length * fontSize

describe('fitText', () => {
  it('短い 1 行は幅いっぱいに広がる', () => {
    const r = fitText({ text: 'おつ', measure: squareMeasure })
    // inner = 112、2 文字なので 56px
    expect(r.fontSize).toBe(56)
    expect(r.fits).toBe(true)
    expect(r.lines).toEqual(['おつ'])
  })

  it('長い 1 行は全体が縮む', () => {
    const r = fitText({ text: 'おつかれさまでした', measure: squareMeasure })
    expect(r.fontSize).toBe(Math.floor(112 / 9))
    expect(r.fits).toBe(true)
  })

  it('複数行は高さの制約が効く', () => {
    const r = fitText({ text: 'あ\nい\nう\nえ', measure: squareMeasure })
    // 高さ: 112 / (4 × 1.1) = 25.45 → 25。幅: 112 / 1 = 112。小さい方が採用される
    expect(r.fontSize).toBe(25)
    expect(r.lines).toHaveLength(4)
  })

  it('下限でも収まらないときは fits が false で、文字サイズは下限に止まる', () => {
    const r = fitText({ text: 'あ'.repeat(20), measure: squareMeasure })
    expect(r.fits).toBe(false)
    expect(r.fontSize).toBe(12)
  })

  it('空のテキストは高さの制約まで広がって fits', () => {
    const r = fitText({ text: '', measure: squareMeasure })
    expect(r.fits).toBe(true)
    // 幅の制約が無いので、1 行分の高さ 112 / 1.1 = 101
    expect(r.fontSize).toBe(Math.floor(112 / 1.1))
  })
})

describe('lineCenters', () => {
  it('ブロック全体が中央に来る', () => {
    const r = fitText({ text: 'あ\nい', measure: squareMeasure, lineHeight: 1 })
    const centers = lineCenters(r)
    // fontSize = 56、2 行で高さ 112、上端 8 → 中心は 36 と 92
    expect(centers).toEqual([36, 92])
  })
})

describe('splitLines', () => {
  it('CRLF も改行として扱う', () => {
    expect(splitLines('a\r\nb\nc')).toEqual(['a', 'b', 'c'])
  })
})

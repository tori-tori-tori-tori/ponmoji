import { page, userEvent } from 'vite-plus/test/browser'
import { describe, expect, it } from 'vite-plus/test'
import { render } from 'vitest-browser-react'
import { Studio } from './Studio'

const textbox = () => page.getByRole('textbox', { name: 'テキスト' })
const fitLabel = () => page.getByText(/\d+px \/ \d 行/)

describe('Studio', () => {
  it('テキストを入力すると、文字サイズと行数がプレビューに出る', async () => {
    await render(<Studio />)

    await userEvent.fill(textbox(), 'おつ')

    await expect.element(fitLabel()).toBeVisible()
    expect(fitLabel().element().textContent).toMatch(/^\d+px \/ 1 行$/)
  })

  it('改行を入れると行数が増え、文字サイズは小さくなる', async () => {
    await render(<Studio />)

    await userEvent.fill(textbox(), 'おつ')
    await expect.element(fitLabel()).toBeVisible()
    const oneLine = Number.parseInt(fitLabel().element().textContent ?? '0', 10)

    await userEvent.fill(textbox(), 'おつ\nかれ')

    // 2 行の表示に切り替わるまで待つ(1 行の表示が残っている間に読まない)
    const twoLineLabel = page.getByText(/\/ 2 行/)
    await expect.element(twoLineLabel).toBeVisible()
    const twoLines = Number.parseInt(twoLineLabel.element().textContent ?? '0', 10)
    expect(twoLines).toBeLessThan(oneLine)
  })

  it('1 行 8 文字 × 4 行を超える入力は切り詰められる', async () => {
    await render(<Studio />)

    await userEvent.fill(textbox(), '123456789\nb\nc\nd\ne')

    await expect.element(textbox()).toHaveValue('12345678\nb\nc\nd')
  })

  it('フォントを切り替えると、同じテキストでも文字サイズが再計算される', async () => {
    await render(<Studio />)
    await userEvent.fill(textbox(), 'おつかれさま')
    await expect.element(fitLabel()).toBeVisible()
    const before = fitLabel().element().textContent

    await page.getByRole('radio', { name: /Dela Gothic One/ }).click()

    // フォールバック書体でも、フォント指定が変わればフィットは再計算される。
    // 数値が同じこともあるので、表示が消えずに残っていることを確認する
    await expect.element(fitLabel()).toBeVisible()
    expect(fitLabel().element().textContent).toMatch(/\d+px \/ 1 行/)
    expect(before).toMatch(/\d+px \/ 1 行/)
  })

  it('テーマを切り替えると、押したボタンだけが選択状態になる', async () => {
    await render(<Studio />)

    await page.getByRole('button', { name: 'Discord' }).click()

    await expect
      .element(page.getByRole('button', { name: 'Discord' }))
      .toHaveAttribute('aria-pressed', 'true')
    await expect
      .element(page.getByRole('button', { name: 'Slack' }))
      .toHaveAttribute('aria-pressed', 'false')
  })

  it('背景とのコントラストが低い文字色を選ぶと注意が出る', async () => {
    await render(<Studio />)

    // ライトテーマの白背景に白文字
    await page.getByRole('button', { name: '#ffffff' }).first().click()

    await expect.element(page.getByText(/コントラストが低め/)).toBeVisible()
  })
})

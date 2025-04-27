/**
 * 文字列のトークン数をカウントする（デフォルトは単純な文字数）
 * 今後subwordや実トークン数にも拡張可能
 */
export function countTokens(text: string): number {
  // サロゲートペアや改行も1文字としてカウント
  return Array.from(text).length;
}

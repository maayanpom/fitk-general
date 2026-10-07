// Placeholders like {קוד} left in a draft mean it is not ready to send.
export const hasPlaceholders = (text: string) => /\{[^}]+\}/.test(text)

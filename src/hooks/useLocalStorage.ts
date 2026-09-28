import { useCallback, useEffect, useState } from "react"

function read<T>(key: string, fallback: () => T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback()
    const base = fallback()
    const parsed = JSON.parse(raw)
    // Merge onto defaults so new fields added later still get initial values.
    return base && typeof base === "object" && !Array.isArray(base)
      ? { ...base, ...parsed }
      : parsed
  } catch {
    return fallback()
  }
}

export function useLocalStorage<T>(key: string, fallback: () => T) {
  const [value, setValue] = useState<T>(() => read(key, fallback))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage unavailable (private mode, quota) - keep in-memory state only.
    }
  }, [key, value])

  const reset = useCallback(() => setValue(fallback()), [fallback])

  return [value, setValue, reset] as const
}

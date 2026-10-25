export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

/** `35%`, `29°C`, but `120 bpm` and `3 tries` — word units get a space. */
export const withUnit = (n: number, unit: string) => `${fmt(n)}${/^[a-zµ]/i.test(unit) ? ' ' : ''}${unit}`

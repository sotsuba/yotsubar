export function fmt(sec) {
    const s = Math.abs(Math.round(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const x = s % 60;
    const p = n => String(n).padStart(2, '0');
    return `${sec < 0 ? '+' : ''}${p(h)}:${p(m)}:${p(x)}`;
}
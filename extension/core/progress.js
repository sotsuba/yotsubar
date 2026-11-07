export function dayKey(now = new Date(), resetHour = 0) {
    const d = new Date(now.getTime() - resetHour * 3600 * 1000);
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

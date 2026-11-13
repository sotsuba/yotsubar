export function fmtBudget(sec) {
    const total = Math.ceil(Math.abs(sec) / 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h && m ? `${h}h${m}m` : h ? `${h}h` : `${m}m`;
}

export function parseBudget(text) {
    const s = text.trim();
    const hm = s.match(/^(?:(\d+(?:\.\d+)?)h)?(?:(\d+(?:\.\d+)?)m)?$/i);
    if (hm && (hm[1] !== undefined || hm[2] !== undefined))
        return Math.round((Number(hm[1] ?? 0) * 3600) + (Number(hm[2] ?? 0) * 60));
    if (!/^\d+(?:\.\d+)?$/.test(s))
        return NaN;

    const seconds = Math.round(Number(s) * 60);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : NaN;
}
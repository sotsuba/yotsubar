import Gdk from 'gi://Gdk?version=4.0';

export function fmtBudget(sec) {
    if (sec % 60 !== 0)
        return `${sec / 60}m`;

    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
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

export function hexToRgba(hex) {
    const rgba = new Gdk.RGBA();
    rgba.parse(hex);
    return rgba;
}

export function rgbaToHex(rgba) {
    return '#' + [rgba.red, rgba.green, rgba.blue]
        .map(c => Math.round(c * 255).toString(16).padStart(2, '0'))
        .join('');
}

import Gdk from 'gi://Gdk?version=4.0';

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

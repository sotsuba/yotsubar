import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

const OVER_BUDGET_COLOR = '#E24B4A';
const BAR_WIDTH = 120;
const BAR_HEIGHT = 6;
const SEG_GAP = 2;

export const UsageBar = GObject.registerClass(
class UsageBar extends St.BoxLayout {
    _init(cats) {
        super._init({
            style_class: 'yotsubar-bar',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._build(cats);
    }

    _build(cats) {
        const total = cats.reduce((a, c) => a + c.budget, 0);
        const gaps = (cats.length - 1) * SEG_GAP;
        this._segs = cats.map(c => {
            const width = Math.round((c.budget / total) * (BAR_WIDTH - gaps));
            const seg = new St.Widget({style_class: 'yotsubar-seg', width, height: BAR_HEIGHT});
            const fill = new St.Widget({style_class: 'yotsubar-seg', width: 0, height: BAR_HEIGHT});
            seg.add_child(fill);
            this.add_child(seg);
            return {seg, fill, width};
        });
    }

    render(cats) {
        cats.forEach((cat, i) => {
            const {seg, fill, width} = this._segs[i];
            const remaining = cat.budget - cat.used;
            const over = remaining < 0;
            const ratio = cat.budget > 0 ? Math.min(1, Math.max(0, remaining / cat.budget)) : 0;
            seg.set_style(
                `background-color: ${over ? OVER_BUDGET_COLOR : cat.soft};`
            );

            fill.set_style(
                `background-color: ${over ? OVER_BUDGET_COLOR : cat.color};`
            );

            fill.set_width(over ? width : Math.round(width * ratio));
        });
    }
});

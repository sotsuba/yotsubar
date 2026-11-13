import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { fmtBudget } from '../core/fmt.js';

const MENU_BAR_WIDTH = 220;
const OVER_BUDGET_COLOR = '#E24B4A';

export const CategoryRow = GObject.registerClass(
class extends PopupMenu.PopupBaseMenuItem {
    _init(cat, onActivate) {
        super._init({style_class: 'yotsubar-row'});

        const dot = new St.Widget({style_class: 'yotsubar-dot', y_align: Clutter.ActorAlign.CENTER});
        dot.set_style(`background-color: ${cat.color};`);

        const col = new St.BoxLayout({vertical: true, x_expand: true});
        const top = new St.BoxLayout();
        const name = new St.Label({text: cat.name, x_expand: true});
        this._left = new St.Label({style_class: 'yotsubar-sub'});
        top.add_child(name);
        top.add_child(this._left);

        this._track = new St.Widget({style_class: 'yotsubar-track', width: MENU_BAR_WIDTH, height: 5});
        this._fill = new St.Widget({style_class: 'yotsubar-track', width: 0, height: 5});
        this._track.add_child(this._fill);

        col.add_child(top);
        col.add_child(this._track);
        this.add_child(dot);
        this.add_child(col);

        this.connect('activate', onActivate);
    }

    render(cat, isActive) {
        const over = cat.used > cat.budget;
        const ratio = Math.min(1, cat.used / cat.budget);

        this._left.set_text(over ? `${fmtBudget(cat.budget - cat.used)} lố` : `${fmtBudget(cat.budget - cat.used)} còn lại`);
        this._track.set_style(`background-color: ${over ? OVER_BUDGET_COLOR : cat.soft};`);
        this._fill.set_style(`background-color: ${over ? OVER_BUDGET_COLOR : cat.color};`);
        this._fill.set_width(Math.round(MENU_BAR_WIDTH * ratio));

        if (isActive) this.add_style_class_name('yotsubar-row-active');
        else this.remove_style_class_name('yotsubar-row-active');
    }
});
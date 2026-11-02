import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

// TODO: hardcode.
const DEFAULT_CATS = [
    {name: 'Speech', color: '#7F77DD', soft: 'rgba(127,119,221,0.3)', budget: 4 * 3600, used: 3600},
    {name: 'English', color: '#1D9E75', soft: 'rgba(29,158,117,0.3)', budget: 3600, used: 0},
    {name: 'Code', color: '#D85A30', soft: 'rgba(216,90,48,0.3)', budget: 2 * 3600, used: 1800},
];

const OVER_BUDGET_COLOR = '#E24B4A';
const PANEL_BAR_WIDTH = 120;
const PANEL_BAR_HEIGHT = 6;
const MENU_BAR_WIDTH = 220;

function fmt(sec) {
    const s = Math.abs(Math.round(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const x = s % 60;
    const p = n => String(n).padStart(2, '0');
    return `${sec < 0 ? '+' : ''}${p(h)}:${p(m)}:${p(x)}`;
}

export const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.5, 'yotsubar');
        this._activeIdx = null;
        this._cats = DEFAULT_CATS.map(c => ({...c}));

        const box = new St.BoxLayout({style_class: 'yotsubar-box'});
        this.add_child(box);

        this._dot = new St.Widget({
            style_class: 'yotsubar-dot',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._label = new St.Label({y_align: Clutter.ActorAlign.CENTER});
        this._bar = new St.BoxLayout({
            style_class: 'yotsubar-bar',
            y_align: Clutter.ActorAlign.CENTER,
        });

        box.add_child(this._dot);
        box.add_child(this._label);
        box.add_child(this._bar);

        this._buildBar();
        this._buildMenu();
        this._render();
        this._timerId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            1,
            () => this._tick()
        );
    }

    _buildBar() {
        const total = this._cats.reduce((a, c) => a + c.budget, 0);
        const gaps = (this._cats.length - 1) * 2;
        this._segs = this._cats.map(c => {
            const width = Math.round((c.budget / total) * (PANEL_BAR_WIDTH - gaps));
            const seg = new St.Widget({style_class: 'yotsubar-seg', width, height: PANEL_BAR_HEIGHT});
            const fill = new St.Widget({style_class: 'yotsubar-seg', width: 0, height: PANEL_BAR_HEIGHT});
            seg.add_child(fill);
            this._bar.add_child(seg);
            return {seg, fill, width};
        });
    }

    _toggleSession(index) {
        this._activeIdx = this._activeIdx === index
            ? null
            : index;

        this._render();
    }

    _tick() {
        if (this._activeIdx === null)
            return GLib.SOURCE_CONTINUE;

        this._cats[this._activeIdx].used += 1;
        this._render();

        return GLib.SOURCE_CONTINUE;
    }

    _buildMenu() {
        this.menu.box.add_style_class_name('yotsubar-popup');

        const head = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
        this._headTitle = new St.Label({text: 'Hôm nay', style_class: 'yotsubar-head', x_expand: true});
        this._headSub = new St.Label({style_class: 'yotsubar-sub'});
        head.add_child(this._headTitle);
        head.add_child(this._headSub);
        this.menu.addMenuItem(head);

        this._rows = this._cats.map((c, i) => {
            const item = new PopupMenu.PopupBaseMenuItem({style_class: 'yotsubar-row'});
            const dot = new St.Widget({style_class: 'yotsubar-dot', y_align: Clutter.ActorAlign.CENTER});
            dot.set_style(`background-color: ${c.color};`);

            const col = new St.BoxLayout({vertical: true, x_expand: true});
            const top = new St.BoxLayout();
            const name = new St.Label({text: c.name, x_expand: true});
            const left = new St.Label({style_class: 'yotsubar-sub'});
            top.add_child(name);
            top.add_child(left);

            const track = new St.Widget({style_class: 'yotsubar-track', width: MENU_BAR_WIDTH, height: 5});
            const fill = new St.Widget({style_class: 'yotsubar-track', width: 0, height: 5});
            track.add_child(fill);

            col.add_child(top);
            col.add_child(track);
            item.add_child(dot);
            item.add_child(col);

            item.connect('activate', () => {
                this._toggleSession(i);
            });

            this.menu.addMenuItem(item);
            return {item, left, track, fill};
        });
    }

    _render() {
        this._renderBar();
        this._renderIndicator();
        this._renderMenu();
    }

    _renderBar() {
        this._cats.forEach((cat, i) => {
            const {seg, fill, width} = this._segs[i];
            const over = cat.used > cat.budget;
            const ratio = cat.budget > 0 ? Math.min(1, Math.max(0, cat.used / cat.budget)) : 0;
            seg.set_style(
                `background-color: ${over ? OVER_BUDGET_COLOR : cat.soft};`
            );

            fill.set_style(
                `background-color: ${over ? OVER_BUDGET_COLOR : cat.color};`
            );

            fill.set_width(Math.round(width * ratio));
        });
    }

    _renderIndicator() {
        if (this._activeIdx === null) {
            this._dot.set_style('background-color: #888888;');
            this._label.set_text('Paused');
            return;
        }

        const cat = this._cats[this._activeIdx];

        this._dot.set_style(
            `background-color: ${cat.color};`
        );

        this._label.set_text(
            `${cat.name} ${fmt(cat.budget - cat.used)}`
        );
    }

    _renderMenu() {
        if (!this._rows) return;
        let usedSum = 0, budgetSum = 0;
        this._cats.forEach((c, i) => {
            const {item, left, track, fill} = this._rows[i];
            const over = c.used > c.budget;
            const ratio = Math.min(1, c.used / c.budget);

            left.set_text(over ? `${fmt(c.budget - c.used)} lố` : `${fmt(c.budget - c.used)} còn lại`);
            track.set_style(`background-color: ${over ? OVER_BUDGET_COLOR : c.soft};`);
            fill.set_style(`background-color: ${over ? OVER_BUDGET_COLOR : c.color};`);
            fill.set_width(Math.round(MENU_BAR_WIDTH * ratio));

            if (i === this._activeIdx) item.add_style_class_name('yotsubar-row-active');
            else item.remove_style_class_name('yotsubar-row-active');

            usedSum += Math.min(c.used, c.budget);
            budgetSum += c.budget;
        });
        this._headSub.set_text(`${(usedSum / 3600).toFixed(1)}h / ${(budgetSum / 3600).toFixed(1)}h`);
    }

    destroy() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
        super.destroy();
    }
});

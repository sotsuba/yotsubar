import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { fmt } from '../core/fmt.js';
import { IndicatorMenuSection } from './menu.js';

// TODO: hardcode.
const DEFAULT_CATS = [
    {name: 'Speech', color: '#7F77DD', soft: 'rgba(127,119,221,0.3)', budget: 4 * 3600, used: 3600},
    {name: 'English', color: '#1D9E75', soft: 'rgba(29,158,117,0.3)', budget: 3600, used: 0},
    {name: 'Code', color: '#D85A30', soft: 'rgba(216,90,48,0.3)', budget: 2 * 3600, used: 1800},
];

const OVER_BUDGET_COLOR = '#E24B4A';
const PANEL_BAR_WIDTH = 120;
const PANEL_BAR_HEIGHT = 6;

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
        this.menu.box.add_style_class_name('yotsubar-popup');
        this._menuSection = new IndicatorMenuSection(this._cats, (index) => this._toggleSession(index));
        this.menu.addMenuItem(this._menuSection);
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

    _render() {
        this._renderBar();
        this._renderIndicator();
        this._menuSection.render(this._cats, this._activeIdx);
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

    destroy() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
        super.destroy();
    }
});

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { fmt } from '../core/fmt.js';
import { IndicatorMenuSection } from './menu.js';

const OVER_BUDGET_COLOR = '#E24B4A';
const PANEL_BAR_WIDTH = 120;
const PANEL_BAR_HEIGHT = 6;

export const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(tracker, categories, onOpenSettings) {
        super._init(0.5, 'yotsubar');
        this._tracker = tracker;
        this._onOpenSettings = onOpenSettings;
        this._activeIdx = null;
        this._cats = categories.map(c => {
            const n = parseInt(c.color.slice(1), 16);
            return {
                ...c,
                budget: c.daily_budget_sec,
                used: 0,
                soft: `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, 0.3)`,
            };
        });

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
        this._menuSection = new IndicatorMenuSection(this._cats, index => {
            const id = this._cats[index].id;
            if (this._tracker.activeId === id)
                this._tracker.stop();
            else
                this._tracker.start(id);
        });
        this.menu.addMenuItem(this._menuSection);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        const settingsItem = new PopupMenu.PopupMenuItem('Settings');
        settingsItem.connect('activate', () => {
            this.menu.close();
            this._onOpenSettings?.();
        });
        this.menu.addMenuItem(settingsItem);
        this.refresh();
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

    refresh() {
        this._cats.forEach(c => { c.used = this._tracker.usedSeconds(c.id); });
        const idx = this._cats.findIndex(c => c.id === this._tracker.activeId);
        this._activeIdx = idx === -1 ? null : idx;

        this._renderBar();
        this._renderIndicator();
        this._menuSection.render(this._cats, this._activeIdx);
    }

    _renderBar() {
        this._cats.forEach((cat, i) => {
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
});
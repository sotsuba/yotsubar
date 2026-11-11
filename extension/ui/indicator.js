import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { fmt } from '../core/fmt.js';
import { IndicatorMenuSection } from './menu.js';
import { UsageBar } from './usageBar.js';

export const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(tracker, categories, onOpenSettings) {
        super._init(0.5, 'yotsubar');
        this._tracker = tracker;
        this._onOpenSettings = onOpenSettings;
        this._activeIdx = null;
        this._cats = this._buildCats(categories);

        this._box = new St.BoxLayout({style_class: 'yotsubar-box'});
        this.add_child(this._box);

        this._dot = new St.Widget({
            style_class: 'yotsubar-dot',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._label = new St.Label({y_align: Clutter.ActorAlign.CENTER});
        this._bar = new UsageBar(this._cats);

        this._box.add_child(this._dot);
        this._box.add_child(this._label);
        this._box.add_child(this._bar);

        this.menu.box.add_style_class_name('yotsubar-popup');
        this._menuSection = this._createMenuSection();
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        const settingsItem = new PopupMenu.PopupMenuItem('Settings');
        settingsItem.connect('activate', () => {
            this.menu.close();
            this._onOpenSettings?.();
        });
        this.menu.addMenuItem(settingsItem);
        this.refresh();
    }

    setCategories(categories) {
        this._cats = this._buildCats(categories);

        if (this._tracker.activeId !== null &&
            !this._cats.some(c => c.id === this._tracker.activeId))
            this._tracker.stop();

        this._bar.destroy();
        this._bar = new UsageBar(this._cats);
        this._box.add_child(this._bar);

        this._menuSection.destroy();
        this._menuSection = this._createMenuSection();

        this.refresh();
    }

    _buildCats(categories) {
        return categories.map(c => {
            const n = parseInt(c.color.slice(1), 16);
            return {
                ...c,
                budget: c.daily_budget_sec,
                used: 0,
                soft: `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, 0.3)`,
            };
        });
    }

    _createMenuSection() {
        const section = new IndicatorMenuSection(this._cats, index => {
            const id = this._cats[index].id;
            if (this._tracker.activeId === id)
                this._tracker.stop();
            else
                this._tracker.start(id);
        });
        this.menu.addMenuItem(section, 0);
        return section;
    }

    refresh() {
        this._cats.forEach(c => { c.used = this._tracker.usedSeconds(c.id); });
        const idx = this._cats.findIndex(c => c.id === this._tracker.activeId);
        this._activeIdx = idx === -1 ? null : idx;

        this._bar.render(this._cats);
        this._renderIndicator();
        this._menuSection.render(this._cats, this._activeIdx);
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
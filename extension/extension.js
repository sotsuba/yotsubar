/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// TODO: hardcode.
const CATS = [
    {name: 'Speech', color: '#7F77DD', soft: 'rgba(127,119,221,0.3)', budget: 4 * 3600, used: 3600},
    {name: 'English', color: '#1D9E75', soft: 'rgba(29,158,117,0.3)', budget: 3600, used: 0},
    {name: 'Code', color: '#D85A30', soft: 'rgba(216,90,48,0.3)', budget: 2 * 3600, used: 1800},
];
const OVER = '#E24B4A';
const BAR_W = 120;
const BAR_H = 6;
const ACTIVE = 0;

function fmt(sec) {
    const s = Math.abs(Math.round(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const x = s % 60;
    const p = n => String(n).padStart(2, '0');
    return `${sec < 0 ? '+' : ''}${p(h)}:${p(m)}:${p(x)}`;
}

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'yotsubar');

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
        this._render();

        this._timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            CATS[ACTIVE].used += 1;
            this._render();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _buildBar() {
        const total = CATS.reduce((a, c) => a + c.budget, 0);
        const gaps = (CATS.length - 1) * 2;
        this._segs = CATS.map(c => {
            const width = Math.round((c.budget / total) * (BAR_W - gaps));
            const seg = new St.Widget({style_class: 'yotsubar-seg', width, height: BAR_H});
            const fill = new St.Widget({style_class: 'yotsubar-seg', width: 0, height: BAR_H});
            seg.add_child(fill);
            this._bar.add_child(seg);
            return {seg, fill, width};
        });
    }

    _render() {
        CATS.forEach((c, i) => {
            const {seg, fill, width} = this._segs[i];
            const over = c.used > c.budget;
            const ratio = Math.min(1, c.used / c.budget);
            seg.set_style(`background-color: ${over ? OVER : c.soft};`);
            fill.set_style(`background-color: ${over ? OVER : c.color};`);
            fill.set_width(Math.round(width * ratio));
        });

        const a = CATS[ACTIVE];
        this._dot.set_style(`background-color: ${a.color};`);
        this._label.set_text(`${a.name} ${fmt(a.budget - a.used)}`);
    }

    destroy() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
        super.destroy();
    }
});

export default class IndicatorExampleExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator, 1, 'left');
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

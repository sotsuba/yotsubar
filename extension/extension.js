import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Indicator} from './ui/indicator.js';
import {Tracker} from './services/tracker.js';
import {dataDir} from './storage/paths.js';
import {DEFAULT_CATEGORIES} from './core/defaultCategories.js';

export default class YotsubarExtension extends Extension {
    enable() {
        this._cleanups = [];
        const own = obj => { this._cleanups.push(() => obj.destroy()); return obj; };

        this._tracker = own(new Tracker(dataDir, () => this._indicator?.refresh()));
        this._indicator = own(new Indicator(this._tracker, DEFAULT_CATEGORIES));
        Main.panel.addToStatusArea(this.uuid, this._indicator, 1, 'left');
    }

    disable() {
        for (const cleanup of this._cleanups.reverse()) {
            try { cleanup(); } catch (e) { console.error('timebudget cleanup', e); }
        }
        this._cleanups = null;
        this._tracker = null;
        this._indicator = null;
    }
}
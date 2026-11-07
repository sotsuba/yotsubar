import GLib from 'gi://GLib';
import {dayKey} from '../core/progress.js';
import {loadProgress, saveProgress} from '../storage/progressStore.js';

const SAVE_EVERY_SEC = 30;

export class Tracker {
    constructor(dataDir, onChange) {
        this._dataDir = dataDir;
        this._onChange = onChange;
        this._day = dayKey();
        this._used = loadProgress(dataDir, this._day);
        this._activeId = null;

        this._tickId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            this._tick();
            return GLib.SOURCE_CONTINUE;
        });
        this._saveId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, SAVE_EVERY_SEC, () => {
            this._save();
            return GLib.SOURCE_CONTINUE;
        });
    }

    get activeId() { return this._activeId; }

    usedSeconds(id) { return this._used[id] ?? 0; }

    start(id) {
        this._activeId = id;
        this._save();
        this._onChange();
    }

    stop() {
        this._activeId = null;
        this._save();
        this._onChange();
    }

    _tick() {
        const today = dayKey();
        if (today !== this._day) {
            this._save();
            this._day = today;
            this._used = {};
        }
        if (this._activeId)
            this._used[this._activeId] = this.usedSeconds(this._activeId) + 1;
        this._onChange();
    }

    _save() {
        saveProgress(this._dataDir, this._day, this._used);
    }

    destroy() {
        GLib.source_remove(this._tickId);
        GLib.source_remove(this._saveId);
        this._save();
    }
}
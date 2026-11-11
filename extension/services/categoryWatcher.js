import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import {loadCategories} from '../storage/categoryStore.js';

const CATEGORIES_FILE = 'categories.json';

export class CategoryWatcher {
    constructor(dataDir, initialCategories, onChange) {
        this._dataDir = dataDir;
        this._onChange = onChange;
        this._lastKey = JSON.stringify(initialCategories);

        GLib.mkdir_with_parents(dataDir, 0o755);
        this._monitor = Gio.File.new_for_path(dataDir)
            .monitor_directory(Gio.FileMonitorFlags.NONE, null);
        this._handlerId = this._monitor.connect('changed', (_monitor, file, _other, event) => {
            if (file.get_basename() !== CATEGORIES_FILE ||
                event === Gio.FileMonitorEvent.DELETED)
                return;
            this._reload();
        });
    }

    _reload() {
        const categories = loadCategories(this._dataDir);
        const key = JSON.stringify(categories);
        if (key === this._lastKey)
            return;
        this._lastKey = key;
        this._onChange(categories);
    }

    destroy() {
        this._monitor.disconnect(this._handlerId);
        this._monitor.cancel();
    }
}

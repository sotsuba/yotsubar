import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {CategoryRow} from './categoryRow.js';
import {showCategoryDialog} from './categoryDialog.js';
import {loadCategories, saveCategories} from '../storage/categoryStore.js';
import {dataDir} from '../storage/paths.js';

export function createCategoriesPage(window) {
    const page = new Adw.PreferencesPage({ title: 'Categories', icon_name: 'view-list-symbolic' });
    const addBtn = new Gtk.Button({
        icon_name: 'list-add-symbolic',
        valign: Gtk.Align.CENTER,
        tooltip_text: 'Add category',
    });
    addBtn.add_css_class('flat');

    const group = new Adw.PreferencesGroup({
        title: 'Time Budget Categories',
        description: 'Changes take effect after restarting the extension.',
        header_suffix: addBtn,
    });
    page.add(group);

    let categories = loadCategories(dataDir);
    let rows = [];

    function saveAndRebuild() {
        saveCategories(dataDir, categories);
        rebuild();
    }

    function deleteCategory(id) {
        categories = categories.filter(category => category.id !== id);
        saveAndRebuild();
    }

    function editCategory(category) {
        showCategoryDialog(window, category, updated => {
            categories = categories.map(item => item.id === updated.id ? updated : item);
            saveAndRebuild();
        });
    }

    function rebuild() {
        rows.forEach(row => group.remove(row));
        rows = categories.map(category => {
            const row = new CategoryRow(category, {onDelete: deleteCategory, onEdit: editCategory});
            group.add(row);
            return row;
        });
    }

    addBtn.connect('clicked', () => showCategoryDialog(window, null, category => {
        categories = [...categories, category];
        saveAndRebuild();
    }));

    rebuild();
    return page;
}

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';

import {DAY_SEC, MAX_NAME_LENGTH} from '../storage/categoryStore.js';
import {fmtBudget, parseBudget, hexToRgba, rgbaToHex} from './utils.js';

// allocatedSec: total budget of all other categories (excluding the one being edited).
export function showCategoryDialog(parent, existing, allocatedSec, onSave) {
    const isEdit = existing !== null;

    const nameRow = new Adw.EntryRow({ title: 'Name', text: existing?.name ?? '' });
    const budgetRow = new Adw.EntryRow({
        title: 'Budget (2h, 1h30m, 45m)',
        text: existing?.daily_budget_sec ? fmtBudget(existing.daily_budget_sec) : '',
    });

    const colorBtn = new Gtk.ColorButton({ use_alpha: false, valign: Gtk.Align.CENTER });
    colorBtn.set_rgba(hexToRgba(existing?.color ?? '#888888'));
    const colorRow = new Adw.ActionRow({ title: 'Color' });
    colorRow.add_suffix(colorBtn);

    const list = new Gtk.ListBox({ selection_mode: Gtk.SelectionMode.NONE, css_classes: ['boxed-list'] });
    list.append(nameRow);
    list.append(colorRow);
    list.append(budgetRow);

    const hint = new Gtk.Label({ xalign: 0, wrap: true, css_classes: ['dim-label', 'caption'] });
    const content = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 6 });
    content.append(list);
    content.append(hint);

    const dialog = new Adw.MessageDialog({
        transient_for: parent,
        modal: true,
        heading: isEdit ? 'Edit Category' : 'Add Category',
        extra_child: content,
    });
    dialog.add_response('cancel', 'Cancel');
    dialog.add_response('save', isEdit ? 'Save' : 'Add');
    dialog.set_default_response('save');
    dialog.set_response_appearance('save', Adw.ResponseAppearance.SUGGESTED);

    function validate() {
        const nameLength = nameRow.get_text().trim().length;
        const validName = nameLength > 0 && nameLength <= MAX_NAME_LENGTH;
        const seconds = parseBudget(budgetRow.get_text());
        const validBudget = Number.isFinite(seconds) && seconds > 0 && seconds <= DAY_SEC &&
            allocatedSec + seconds <= DAY_SEC;
        nameRow.remove_css_class('error');
        budgetRow.remove_css_class('error');
        if (!validName && nameRow.get_text())
            nameRow.add_css_class('error');
        if (!validBudget && budgetRow.get_text())
            budgetRow.add_css_class('error');

        hint.set_text(nameLength > MAX_NAME_LENGTH
            ? `Name must be ${MAX_NAME_LENGTH} characters or fewer.`
            : `${fmtBudget(Math.max(0, DAY_SEC - allocatedSec))} left of 24h across all categories.`);

        dialog.set_response_enabled('save', validName && validBudget);
    }

    nameRow.connect('notify::text', validate);
    budgetRow.connect('notify::text', validate);
    validate();

    dialog.connect('response', (_d, responseId) => {
        if (responseId !== 'save') {
            dialog.destroy();
            return;
        }

        const name = nameRow.get_text().trim();

        const budgetSec = parseBudget(budgetRow.get_text());
        if (!name || name.length > MAX_NAME_LENGTH ||
            !Number.isFinite(budgetSec) || budgetSec <= 0 ||
            budgetSec > DAY_SEC || allocatedSec + budgetSec > DAY_SEC)
            return;

        onSave({
            id: isEdit ? existing.id : GLib.uuid_string_random(),
            name,
            color: rgbaToHex(colorBtn.get_rgba()),
            daily_budget_sec: budgetSec,
        });
        dialog.destroy();
    });

    dialog.present();
}


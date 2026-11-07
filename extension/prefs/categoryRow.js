import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';

import {fmtBudget} from './utils.js';

function colorDot(color) {
    const dot = new Gtk.Box({ valign: Gtk.Align.CENTER });
    const p = new Gtk.CssProvider();
    p.load_from_data(`box { border-radius:7px; background-color:${color}; min-width:14px; min-height:14px; }`, -1);
    dot.get_style_context().add_provider(p, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
    return dot;
}

export const CategoryRow = GObject.registerClass(
class CategoryRow extends Adw.ActionRow {
    _init(cat, {onDelete, onEdit}) {
        super._init({ title: cat.name, subtitle: `${fmtBudget(cat.daily_budget_sec)}  ·  ${cat.color}` });
        this.add_prefix(colorDot(cat.color));

        const editBtn = new Gtk.Button({ icon_name: 'document-edit-symbolic', valign: Gtk.Align.CENTER, tooltip_text: 'Edit' });
        editBtn.add_css_class('flat');
        editBtn.connect('clicked', () => onEdit(cat));

        const delBtn = new Gtk.Button({ icon_name: 'user-trash-symbolic', valign: Gtk.Align.CENTER, tooltip_text: 'Delete' });
        delBtn.add_css_class('flat');
        delBtn.add_css_class('destructive-action');
        delBtn.connect('clicked', () => onDelete(cat.id));

        this.add_suffix(editBtn);
        this.add_suffix(delBtn);
    }
});


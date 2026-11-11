import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import St from 'gi://St';
import { CategoryRow } from './categoryRow.js';

export class IndicatorMenuSection extends PopupMenu.PopupMenuSection {
    constructor(cats, onToggleCategory) {
        super();
        this._onToggleCategory = onToggleCategory;

        const head = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
        head.add_child(new St.Label({text: 'Today', style_class: 'yotsubar-head', x_expand: true}));
        this._headSub = new St.Label({style_class: 'yotsubar-sub'});
        head.add_child(this._headSub);
        this.addMenuItem(head);

        this._rows = cats.map((c, i) => {
            const row = new CategoryRow(c, () => this._onToggleCategory(i));
            this.addMenuItem(row);
            return row;
        });
    }

    render(cats, activeIdx) {
        let usedSum = 0;
        let budgetSum = 0;

        cats.forEach((cat, i) => {
            this._rows[i].render(cat, i === activeIdx);
            usedSum += Math.min(cat.used, cat.budget);
            budgetSum += cat.budget;
        });

        this._headSub.set_text(`${(usedSum / 3600).toFixed(1)}h / ${(budgetSum / 3600).toFixed(1)}h`);
    }
}

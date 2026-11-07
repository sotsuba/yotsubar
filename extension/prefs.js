import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import {createCategoriesPage} from './prefs/categoriesPage.js';

export default class YotsubarPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window.set_default_size(480, 520);
        window.add(createCategoriesPage(window));
    }
}

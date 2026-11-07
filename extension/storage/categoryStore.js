import * as jsonFile from './jsonFile.js';

const DEFAULT_CATEGORIES = [
    {id: 'speech',  name: 'Speech',  color: '#7F77DD', daily_budget_sec: 4 * 3600},
    {id: 'english', name: 'English', color: '#1D9E75', daily_budget_sec: 3600},
    {id: 'code',    name: 'Code',    color: '#D85A30', daily_budget_sec: 2 * 3600},
];

function isValidCategory(category) {
    return category !== null &&
        typeof category === 'object' &&
        !Array.isArray(category) &&
        typeof category.id === 'string' && category.id.trim().length > 0 &&
        typeof category.name === 'string' && category.name.trim().length > 0 &&
        typeof category.color === 'string' && /^#[0-9a-f]{6}$/i.test(category.color) &&
        Number.isSafeInteger(category.daily_budget_sec) && category.daily_budget_sec > 0;
}

export function loadCategories(dataDir) {
    const data = jsonFile.load(dataDir, 'categories.json');
    if (!Array.isArray(data?.categories)) {
        if (data !== null)
            console.warn('yotsubar: invalid categories store, using defaults');
        return DEFAULT_CATEGORIES.map(category => ({...category}));
    }

    const ids = new Set();
    return data.categories.filter((category, index) => {
        if (!isValidCategory(category)) {
            console.warn(`yotsubar: ignoring invalid category at index ${index}`);
            return false;
        }
        if (ids.has(category.id)) {
            console.warn(`yotsubar: ignoring duplicate category at index ${index}`);
            return false;
        }
        ids.add(category.id);
        return true;
    });
}

export function saveCategories(dataDir, categories) {
    jsonFile.save(dataDir, 'categories.json', { v: 1, categories });
}

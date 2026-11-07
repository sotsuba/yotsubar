import * as jsonFile from './jsonFile.js';

export function loadProgress(dataDir, day) {
    const file = jsonFile.load(`${dataDir}/progress`, `${day}.json`);
    return file?.used ?? {};
}

export function saveProgress(dataDir, day, used) {
    jsonFile.save(`${dataDir}/progress`, `${day}.json`, {v: 1, used});
}
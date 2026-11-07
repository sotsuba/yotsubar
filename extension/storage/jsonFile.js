import GLib from 'gi://GLib';

const decoder = new TextDecoder('utf-8');

function pathOf(dataDir, fileName) {
    return GLib.build_filenamev([dataDir, fileName]);
}

export function save(dataDir, fileName, data) {
    GLib.mkdir_with_parents(dataDir, 0o755);
    GLib.file_set_contents(
        pathOf(dataDir, fileName),
        JSON.stringify(data, null, 2)
    );
}

export function load(dataDir, fileName) {
    const path = pathOf(dataDir, fileName);
    if (!GLib.file_test(path, GLib.FileTest.EXISTS))
        return null;

    const [, bytes] = GLib.file_get_contents(path);
    try {
        return JSON.parse(decoder.decode(bytes));
    } catch (e) {
        console.error(`timebudget: ${fileName} bị hỏng, đã backup`, e);
        GLib.rename(path, `${path}.corrupt-${Date.now()}`);
        return null;
    }
}
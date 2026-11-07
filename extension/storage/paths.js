import GLib from 'gi://GLib';

export const dataDir = GLib.build_filenamev([GLib.get_user_data_dir(), 'timebudget']);
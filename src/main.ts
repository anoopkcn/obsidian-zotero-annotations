import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS } from "./constants";
import { fuzzySelectReference } from "./modal";
import { SettingsTab } from "./settings";
import { PluginSettings } from "./types";
import { updateNotes as updateNotes } from "./utils";

// This is the main plugin class
// It is responsible for loading the plugin settings, adding the settings tab, and adding the command
// layout of the plugin
// 1. On Load 
//      - Load the settings
//      - Add the settings page for the plugin (SettingTab)
//      - Add the command for Create Literature Note or  Update Literature Notes
// 2. Save settings function for the settings page

export default class ZoteroAnnotations extends Plugin {
    settings: PluginSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new SettingsTab(this.app, this));

        this.addCommand({
            id: "zotero_annotations-select-reference-modal",
            name: "Create or Update Note",
            callback: () => {
                new fuzzySelectReference(this.app, this).open();
            },
        });

        this.addCommand({
            id: "zotero_annotations-update-library",
            name: "Update All Notes",
            callback: () => updateNotes(this.settings),
        });
    }

    onunload() { }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
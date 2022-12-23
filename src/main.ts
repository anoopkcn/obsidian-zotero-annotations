import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS } from "./constants";
import { fuzzySelectEntryFromJson } from "./modal";
import { SettingTab } from "./settings";
import { MyPluginSettings } from "./types";
import { updateLibrary } from "./utils";

// This is the main plugin class
// It is responsible for loading the plugin settings, adding the settings tab, and adding the command
// layout of the plugin
// 1. On Load 
//      - Load the settings
//      - Add the settings page for the plugin (SettingTab)
//      - Add the command for Create Literature Note or  Update Literature Notes
// 2. Save settings function for the settings page

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new SettingTab(this.app, this));

        this.addCommand({
            id: "zotero_annotations-select-reference-modal",
            name: "Create/Update Literature Note",
            callback: () => {
                new fuzzySelectEntryFromJson(this.app, this).open();
            },
        });

        this.addCommand({
            id: "zotero_annotations-update-library",
            name: "Update Library",
            callback: () => updateLibrary(this.settings),
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
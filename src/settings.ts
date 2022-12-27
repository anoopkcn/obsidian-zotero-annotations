import { App, PluginSettingTab, Setting } from "obsidian";
import ZoteroAnnotations from "./main";
import { t } from "./lang/helpers";
import { fragWithHTML } from "./utils";

export class SettingsTab extends PluginSettingTab {
    plugin: ZoteroAnnotations;
    constructor(app: App, plugin: ZoteroAnnotations) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl, plugin } = this;
        const { settings } = plugin;

        containerEl.empty();

        // containerEl.createEl("h1", { text: "Zotero Annotations " });

        containerEl.createEl("h2", { text: "General Settings" });
        new Setting(containerEl)
            .setName(t("JSON_FILE_PATH"))
            .setDesc(fragWithHTML(t("JSON_FILE_PATH_DESC")))
            .addText((text) =>
                text
                    .setPlaceholder(t("JSON_FILE_PATH_PLACEHOLDER"))
                    .setValue(settings.bibPath)
                    .onChange(async (value) => {
                        settings.bibPath = value;
                        await plugin.saveSettings();
                    })
        );

        new Setting(containerEl)
            .setName(t("IMPORT_NOTES_FOLDER"))
            .setDesc(fragWithHTML(t("IMPORT_NOTES_FOLDER_DESC")))
            .addText((text) =>
                text
                    .setPlaceholder(t("IMPORT_NOTES_FOLDER_PLACEHOLDER"))
                    .setValue(settings.importPath)
                    .onChange(async (value) => {
                        settings.importPath = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName(t("NOTE_FILE_NAME"))
            .setDesc(fragWithHTML(t("NOTE_FILE_NAME_DESC")))
            .addText((text) =>
                text
                    .setPlaceholder(t("NOTE_FILE_NAME_PLACEHOLDER"))
                    .setValue(settings.importFileName)
                    .onChange(async (value) => {
                        settings.importFileName = value;
                        await plugin.saveSettings();
                    })
            );

        // containerEl.createEl("h2", { text: "Template" });
        new Setting(containerEl)
            .setName(t("TEMPLATE_FILE"))
            .setDesc(fragWithHTML(t("TEMPLATE_FILE_DESC")))
            .addText((text) =>
                text
                    .setPlaceholder(t("TEMPLATE_FILE_PLACEHOLDER"))
                    .setValue(settings.templatePath)
                    .onChange(async (value) => {
                        settings.templatePath = value;
                        await plugin.saveSettings();
                    })
            );

        containerEl.createEl("h2", { text: "Notes Import Settings" });
        new Setting(containerEl)
            .setName(t("MISSING_FIELDS"))
            .setDesc(fragWithHTML(t("MISSING_FIELDS_DESC")))
            .addDropdown((d) => {
                d.addOption("Leave placeholder", "Leave placeholder");
                d.addOption("Remove (entire row)", "Remove (entire row)");
                d.addOption(
                    "Replace with custom text",
                    "Replace with custom text"
                );
                d.setValue(settings.missingfield);
                d.onChange(
                    async (
                        v:
                            | "Leave placeholder"
                            | "Remove (entire row)"
                            | "Replace with custom text"
                    ) => {
                        settings.missingfield = v;
                        await plugin.saveSettings();
                        this.display();
                    }
                );
            });
        if (settings.missingfield === "Replace with custom text") {
            new Setting(containerEl)
                .setName(t("REPLACE_MISSING_FIELDS"))
                .addText((text) =>
                    text
                        .setValue(settings.missingfieldreplacement)
                        .onChange(async (value) => {
                            settings.missingfieldreplacement = value;
                            await plugin.saveSettings();
                        })
                );
        }

        new Setting(containerEl)
            .setName(t("FORMAT_CREATOR_NAMES"))
            .setDesc(fragWithHTML(t("FORMAT_CREATOR_NAMES_DESC")))
            .addText((text) =>
                text.setValue(settings.nameFormat).onChange(async (value) => {
                    settings.nameFormat = value;
                    await plugin.saveSettings();
                    //this.display();
                })
            );

        new Setting(containerEl)
            .setName(t("MULTIPLE_ENTRIES_DELIMITER"))
            .setDesc(fragWithHTML(t("MULTIPLE_ENTRIES_DELIMITER_DESC")))
            .addText((text) =>
                text
                    .setPlaceholder(",")
                    .setValue(settings.multipleFieldsDivider)
                    .onChange(async (value) => {
                        settings.multipleFieldsDivider = value;
                        await plugin.saveSettings();
                    })
            );

        // containerEl.createEl("h2", { text: "In-text citations" });
        new Setting(containerEl)
            .setName(t("CREATE_BACKLINKS"))
            .setDesc(fragWithHTML(t("CREATE_BACKLINKS_DESC")))
            .addToggle((text) =>
                text
                    .setValue(settings.highlightCitationsLink)
                    .onChange(async (value) => {
                        settings.highlightCitationsLink = value;
                        await plugin.saveSettings();
                        this.display();
                    })
            );

        if (settings.highlightCitationsLink) {
            new Setting(containerEl)
                .setName(t("FORMAT_BACKLINKS"))
                .setDesc(fragWithHTML(t("FORMAT_BACKLINKS_DESC")))
                .addDropdown((d) => {
                    d.addOption(
                        "Author, year, page number",
                        "Author, year, page number"
                    );
                    d.addOption("Only page number", "Only page number");
                    d.addOption("Pandoc", "Pandoc");
                    d.addOption("Empty", "Empty");
                    d.setValue(settings.highlightCitationsFormat);
                    d.onChange(
                        async (
                            v:
                                | "Author, year, page number"
                                | "Only page number"
                                | "Pandoc"
                                | "Empty"
                        ) => {
                            settings.highlightCitationsFormat = v;
                            await plugin.saveSettings();
                        }
                    );
                });
        }

        new Setting(containerEl)
            .setName(t("ORDER_OF_EXTRACTED_ELEMENT"))
            .setDesc(fragWithHTML(t("ORDER_OF_EXTRACTED_ELEMENT_DESC")))
            .addTextArea((text) =>
                text
                    .setValue(settings.highlightExportTemplate)
                    .onChange(async (value) => {
                        settings.highlightExportTemplate = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName(t("MULTIPLE_ANNOTATION_FILES"))
            .setDesc(fragWithHTML(t("MULTIPLE_ANNOTATION_FILES_DESC")))
            .addToggle((t) =>
                t
                    .setValue(settings.importAllAnnotationFiles)
                    .onChange(async (value) => {
                        settings.importAllAnnotationFiles = value;
                        await plugin.saveSettings();
                        this.display();
                    })
            );

        containerEl.createEl("h2", { text: "Notes Update Settings" });
        new Setting(containerEl)
            .setName(t("NOTE_UPDATE_PRESERVATION"))
            .setDesc(fragWithHTML(t("NOTE_UPDATE_PRESERVATION_DESC")))
            .addDropdown((d) => {
                d.addOption("Select Section", "Select Section");
                d.addOption("Overwrite Entire Note", "Overwrite Entire Note");
                d.setValue(settings.saveManualEdits);
                d.onChange(
                    async (
                        v: // | "Save Entire Note"
                            "Select Section" | "Overwrite Entire Note"
                    ) => {
                        settings.saveManualEdits = v;
                        await plugin.saveSettings();
                        this.display();
                    }
                );
            });

        if (settings.saveManualEdits == "Select Section") {
            new Setting(containerEl)
                .setName(t("PRESERVATION_SECTION_START"))
                .setDesc(fragWithHTML(t("PRESERVATION_SECTION_START_DESC")))
                .addText((text) =>
                    text
                        .setValue(settings.saveManualEditsStart)
                        .onChange(async (value) => {
                            settings.saveManualEditsStart = value;
                            await plugin.saveSettings();
                        })
                );

            if (settings.saveManualEdits) {
                new Setting(containerEl)
                    .setName(t("PRESERVATION_SECTION_END"))
                    .setDesc(fragWithHTML(t("PRESERVATION_SECTION_END_DESC")))
                    .addText((text) =>
                        text
                            .setValue(settings.saveManualEditsEnd)
                            .onChange(async (value) => {
                                settings.saveManualEditsEnd = value;
                                await plugin.saveSettings();
                            })
                    );
            }
        }
        new Setting(containerEl)
            .setName(t("OPEN_UPDATED_NOTE"))
            .setDesc(fragWithHTML(t("OPEN_UPDATED_NOTE_DESC")))
            .addToggle((t) =>
                t
                    .setValue(settings.openAfterImport)
                    .onChange(async (value) => {
                        settings.openAfterImport = value;
                        await plugin.saveSettings();
                        this.display();
                    })
            );

        new Setting(containerEl)
            .setName(t("UPDATE_ALL_NOTES"))
            .setDesc(fragWithHTML(t("UPDATE_ALL_NOTES_DESC")))
            .addDropdown((d) => {
                d.addOption("Only existing notes", "Only existing notes");
                d.addOption("Create when missing", "Create when missing");
                d.setValue(settings.updateNotes);
                d.onChange(
                    async (
                        v: "Only existing notes" | "Create when missing"
                    ) => {
                        settings.updateNotes = v;
                        await plugin.saveSettings();
                    }
                );
            });

        containerEl.createEl("h2", { text: "Images Settings" });

        new Setting(containerEl)
            .setName(t("EMBED_IMAGES"))
            .setDesc(fragWithHTML(t("EMBED_IMAGES_DESC")))
            .addToggle((text) =>
                text.setValue(settings.imagesImport).onChange(async (value) => {
                    settings.imagesImport = value;
                    await plugin.saveSettings();
                    this.display();
                })
        );
        if (settings.imagesImport) {
            new Setting(containerEl)
                .setName(t("POSITION_OF_IMAGE_COMMENT"))
                .setDesc(fragWithHTML(t("POSITION_OF_IMAGE_COMMENT_DESC")))
                .addDropdown((d) => {
                    d.addOption("Above the image", "Above the image");
                    d.addOption("Below the image", "Below the image");
                    //d.addOption("Import from Note", "Import from Note");
                    d.setValue(settings.imagesCommentPosition);
                    d.onChange(
                        async (
                            v: "Above the image" | "Below the image"
                            //| "Import from Note"
                        ) => {
                            settings.imagesCommentPosition = v;
                            await plugin.saveSettings();
                            this.display();
                        }
                    );
                });

            new Setting(containerEl)
                .setName(t("IMAGE_COPY"))
                .setDesc(fragWithHTML(t("IMAGE_COPY_DESC")))
                .addToggle((text) =>
                    text
                        .setValue(settings.imagesCopy)
                        .onChange(async (value) => {
                            settings.imagesCopy = value;
                            await plugin.saveSettings();
                            this.display();
                        })
                );
            if (settings.imagesCopy) {
                new Setting(containerEl)
                    .setName(t("IMAGE_COPY_PATH"))
                    .setDesc(fragWithHTML(t("IMAGE_COPY_PATH_DESC")))
                    .addText((text) =>
                        text
                            .setPlaceholder("/path/to/folder")
                            .setValue(settings.imagesPath)
                            .onChange(async (value) => {
                                settings.imagesPath = value;
                                await plugin.saveSettings();
                            })
                    );
            }

            new Setting(containerEl)
                .setName(t("ZOTERO_LOCAL_FOLDER"))
                .setDesc(fragWithHTML(t("ZOTERO_LOCAL_FOLDER_DESC")))
                .addText((text) =>
                    text
                        .setValue(settings.zoteroStoragePathManual)
                        .onChange(async (value) => {
                            settings.zoteroStoragePathManual = value;
                            await plugin.saveSettings();
                        })
                );

        }
    }
}

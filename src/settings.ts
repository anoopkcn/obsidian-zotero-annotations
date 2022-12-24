import MyPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class SettingTab extends PluginSettingTab {
    plugin: MyPlugin;
    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl, plugin } = this;
        const { settings } = plugin;

        containerEl.empty();

        // containerEl.createEl("h1", { text: "Zotero Annotations " });

        containerEl.createEl("h2", { text: "Import Library" });
        new Setting(containerEl)
            .setName("BetterBibTeX JSON File")
            .setDesc(
                "Add relative path from the vault folder to the BetterBibTeX JSON file to be imported."
            )
            .addText((text) =>
                text
                    .setPlaceholder("/path/to/BetterBibTex.json")
                    .setValue(settings.bibPath)
                    .onChange(async (value) => {
                        settings.bibPath = value;
                        await plugin.saveSettings();
                    })
            );

        containerEl.createEl("h2", { text: "Export Notes" });

        new Setting(containerEl)
            .setName("Export Path")
            .setDesc(
                "Add the relative path to the folder inside your vault where the notes will be exported"
            )
            .addText((text) =>
                text
                    .setPlaceholder("/path/to/folder")
                    .setValue(settings.exportPath)
                    .onChange(async (value) => {
                        settings.exportPath = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Note Title")
            .setDesc(
                "Select the format of the title of the note. Possible values include: {{citeKey}}, {{title}}, {{author}},{{authorInitials}}, {{authorFullName}} {{year}}"
            )
            .addText((text) =>
                text
                    .setPlaceholder("@{{citeKey}}")
                    .setValue(settings.exportTitle)
                    .onChange(async (value) => {
                        settings.exportTitle = value;
                        await plugin.saveSettings();
                    })
            );

        containerEl.createEl("h2", { text: "Template" });
        new Setting(containerEl)
            .setName("Template File")
            .setDesc(
                "Add relative path from the vault folder to the template file. If no template is specified, the default template will be used."
            )
            .addText((text) =>
                text
                    .setPlaceholder("Templates/annotations")
                    .setValue(settings.templatePath)
                    .onChange(async (value) => {
                        settings.templatePath = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Missing Fields")
            .setDesc(
                "Fields that are present in the template but missing from the selected field."
            )
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
                .setName("Replacement for missing fields")
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
            .setName("Format Names")
            .setDesc(
                "Specify how the names of the authors/editors should be exported. Accepted values are {{firstName}}, {{lastName}} and {{firstNameInitials}}"
            )
            .addText((text) =>
                text.setValue(settings.nameFormat).onChange(async (value) => {
                    settings.nameFormat = value;
                    await plugin.saveSettings();
                    //this.display();
                })
            );

        new Setting(containerEl)
            .setName("Multiple Entries Delimiter")
            .setDesc(
                "Type the character or expression that should separate multiple values when found in the same field such as  authors, editors, tags, collections, etc."
            )
            .addText((text) =>
                text
                    .setPlaceholder(",")
                    .setValue(settings.multipleFieldsDivider)
                    .onChange(async (value) => {
                        settings.multipleFieldsDivider = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Save Manual Edits")
            .setDesc(
                'Select "Overwrite Entire Note" to overwrite the note on update. "Select Section" will preserve sections that are inside the selected sections and overwrite everything outside the sections. Manual edits/additions to the document will be preserved within the selected sections.'
            )
            .addDropdown((d) => {
                // d.addOption("Save Entire Note", "Save Entire Note");
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
                .setName("Start - Save Manual Edits")
                .setDesc(
                    "Define string (e.g. '## Notes') in the template starting from where updating the note will not overwrite the existing text. If field is left empty, the value will be set to the beginning of the note"
                )
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
                    .setName("End - Save Manual Edits")
                    .setDesc(
                        "Define string (e.g. '## Notes') in the template until where updating the note will not overwrite the existing text. If field is left empty, the value will be set to the end of the note"
                    )
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
        containerEl.createEl("h2", { text: "Open After import" });
        new Setting(containerEl)
            .setName("Open the updated note")
            .setDesc(
                "Select whether to open note in the current view after updating note. Toggle On: Open the updated note"
            )
            .addToggle((t) =>
                t
                    .setValue(settings.openAfterImport)
                    .onChange(async (value) => {
                        settings.openAfterImport = value;
                        await plugin.saveSettings();
                        this.display();
                    })
            );

        containerEl.createEl("h2", { text: "Update Library" });
        new Setting(containerEl)
            .setName("Update Existing/All Notes")
            .setDesc(
                "Select whether to create new notes that are missing from Obsidian but present/modified within Zotero when runing the Update Library command"
            )
            .addDropdown((d) => {
                d.addOption("Only existing notes", "Only existing notes");
                d.addOption("Create when missing", "Create when missing");
                d.setValue(settings.updateLibrary);
                d.onChange(
                    async (
                        v: "Only existing notes" | "Create when missing"
                    ) => {
                        settings.updateLibrary = v;
                        await plugin.saveSettings();
                    }
                );
            });

        containerEl.createEl("h2", { text: "In-text citations" });

        new Setting(containerEl)
            .setName("Format of Zotero Backlinks")
            .setDesc(
                "Select the style of the reference added next to the highlights and figures extracted from the PDF. This feature is for now available only for sources extracted from Zotero"
            )
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
        new Setting(containerEl)
            .setName("Create Link to the Highlight Page in the PDF")
            .setDesc(
                "If enabled, a link will be created at the end of the extracted highlights or figures to the original page of the PDF in the Zotero reader"
            )
            .addToggle((text) =>
                text
                    .setValue(settings.highlightCitationsLink)
                    .onChange(async (value) => {
                        settings.highlightCitationsLink = value;
                        await plugin.saveSettings();
                        this.display();
                    })
            );

        new Setting(containerEl)
            .setName("Structure of the extracted highlights/comments/tag")
            .setDesc("Placeholder include {{highlight}}, {{comment}}, {{tag}}")
            .addTextArea((text) =>
                text
                    .setValue(settings.highlightExportTemplate)
                    .onChange(async (value) => {
                        settings.highlightExportTemplate = value;
                        await plugin.saveSettings();
                    })
            );

        containerEl.createEl("h2", { text: "Import Images" });

        new Setting(containerEl)
            .setName("Import Images")
            .setDesc(
                "This option is available only for notes extracted using the Zotero native PDF reader"
            )
            .addToggle((text) =>
                text.setValue(settings.imagesImport).onChange(async (value) => {
                    settings.imagesImport = value;
                    await plugin.saveSettings();
                    this.display();
                })
            );
        new Setting(containerEl)
            .setName("Zotero Local Folder")
            .setDesc(
                `Add the path on your computer where Zotero's data is stored (e.g. "/Users/yourusername/Zotero/storage"). This field is required only when this is different from the folder where the PDF files are stored. To retrieve this information, open Zotero --> Preferences --> Advanced --> Files and Folder, and copy the "data directory location", followed by the subdirectory "/storage"`
            )
            .addText((text) =>
                text
                    .setValue(settings.zoteroStoragePathManual)
                    .onChange(async (value) => {
                        settings.zoteroStoragePathManual = value;
                        await plugin.saveSettings();
                    })
            );

        if (settings.imagesImport) {
            new Setting(containerEl)
                .setName("Copy the Image into the Obsidian Vault")
                .setDesc(
                    "If this option is selected, images selected through the Zotero reader will be copied into the Vault. If this option is not selected, the note will link to the file stored in Zotero/storage"
                )
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
                    .setName("Image Import Path")
                    .setDesc(
                        "Add the relative path to the folder inside your vault where the image will be copied"
                    )
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
                .setName("Position of Comment to an Image")
                //.setDesc("")
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
        }
    }
}

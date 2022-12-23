import MyPlugin from "./main";
import * as fs from "fs";
import {
    App,
    FuzzySuggestModal,
    Notice,
    Platform,
    normalizePath,
} from "obsidian";

import { Reference, AnnotationElements } from "./types";

import {
    createAuthorKeyFullName,
    createNote,
    createNoteTitle,
    openNoteAfterImport,
    orderByDateModified,
} from "./utils";

export class fuzzySelectEntryFromJson extends FuzzySuggestModal<Reference> {
    plugin: MyPlugin;
    template: string;
    selectArray: Reference[];
    allCitationKeys: string[];
    data: {
        collections: Record<string, never>;
        config: Record<string, never>;
        items: Reference[];
        version: string;
        __proto__: Record<string, never>;
    };
    keyWordArray: string[];
    noteElements: AnnotationElements[];

    constructor(app: App, plugin: MyPlugin) {
        super(app);
        this.plugin = plugin;
    }
    // Function used to move the cursor in the search bar when the modal is launched
    focusInput() {
        //@ts-ignore
        document.getElementsByClassName("prompt-input")[0].focus();
    }
    async onOpen() {
        if (Platform.isDesktopApp) {
            this.focusInput();
        }

        // Load the Json file
        // Check if the json file exists
        const jsonPath =
            //@ts-ignore
            this.app.vault.adapter.getBasePath() +
            "/" +
            this.plugin.settings.bibPath;
        if (!fs.existsSync(jsonPath)) {
            new Notice("No BetterBibTeX JSON file found at " + jsonPath);
        }

        //Create the full path to the json file
        const rawdata = fs.readFileSync(
            //@ts-ignore
            this.app.vault.adapter.getBasePath() +
                "/" +
                this.plugin.settings.bibPath
        );
        const data = JSON.parse(rawdata.toString()); // rawdata is a buffer, convert to string


        const bibtexArray: Reference[] = [];
        for (let index = 0; index < data.items.length; index++) {
            const selectedEntry: Reference = data.items[index];
            const bibtexArrayItem = {} as Reference;

            //Extract the citation key. If the citationkey does not exist skip
            if (selectedEntry.hasOwnProperty("citationKey") == false) continue;
            bibtexArrayItem.citationKey = selectedEntry.citationKey;

            //Extract the title key
            bibtexArrayItem.title = selectedEntry.title;

            // Extract the date
            bibtexArrayItem.date = selectedEntry.date;
            if (selectedEntry.hasOwnProperty("date")) {
                //@ts-ignore
                selectedEntry.year = selectedEntry.date.match(/\d\d\d\d/gm);
                bibtexArrayItem.date = selectedEntry.year;
            }

            //Extract the author
            bibtexArrayItem.authorKey = createAuthorKeyFullName(selectedEntry.creators);

            //Extract the date the entry was modified
            bibtexArrayItem.dateModified = selectedEntry.dateModified;

            //Create the reference
            bibtexArrayItem.inlineReference = bibtexArrayItem.authorKey +
                " (" + bibtexArrayItem.date + ") " +
                bibtexArrayItem.title + 
                "\n" +
                bibtexArrayItem.citationKey;

            bibtexArray.push(bibtexArrayItem);
        }
        // Order the suggestions from the one modified most recently
        bibtexArray.sort(orderByDateModified);

        //Export all citationKeys
        this.allCitationKeys = bibtexArray.map((a) => a.citationKey);

        this.selectArray = bibtexArray;
        await this.updateSuggestions();
        this.data = data;
    }
    // Returns all available suggestions.
    getItems(): Reference[] {
        return this.selectArray;
    }

    // Renders each suggestion item.
    getItemText(referenceSelected: Reference) {
        return referenceSelected.inlineReference;
    }
    async updateSuggestions() {
        // @ts-ignore: not exposed in API.
        await super.updateSuggestions();
    }

    // Perform action on the selected suggestion.
    async onChooseItem(
        referenceSelected: Reference,
        evt: MouseEvent | KeyboardEvent
    ) {
        //Create an array where you store the citekey to be processed
        let citeKeyToBeProcessed: string[] = [];
        citeKeyToBeProcessed.push(referenceSelected.citationKey);

        // Loop to process the selected note
        for (
            let indexNoteToBeProcessed = 0;
            indexNoteToBeProcessed < citeKeyToBeProcessed.length;
            indexNoteToBeProcessed++
        ) {
            //Find the index of the reference selected
            const indexSelectedReference = this.data.items.findIndex(
                (item: { citationKey: string }) =>
                    item.citationKey ===
                    citeKeyToBeProcessed[indexNoteToBeProcessed]
            );

            //Selected Reference
            const selectedEntry: Reference =
                this.data.items[indexSelectedReference];

            //Create and export Note for select reference
            createNote(selectedEntry, this.plugin.settings)

            //open note  after import
            const noteTitleFull = createNoteTitle(
                selectedEntry,
                this.plugin.settings.exportTitle,
                this.plugin.settings.exportPath
            );
            const noteTitleShort = noteTitleFull.replace(
                //@ts-ignore
                normalizePath(this.app.vault.adapter.getBasePath()) + "/",
                ""
            );
            // console.log(noteTitleShort)
            const myFile = this.app.metadataCache.getFirstLinkpathDest(normalizePath(noteTitleShort), "")
            openNoteAfterImport(myFile, this.plugin.settings.openAfterImport)
        }
    }
}

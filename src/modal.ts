import * as fs from "fs";
import {
    App,
    FuzzyMatch,
    FuzzySuggestModal,
    Notice,
    Platform,
    SearchMatchPart,
    SearchMatches,
    normalizePath,
    renderMatches,
} from "obsidian";
import ZoteroAnnotations from "./main";
import { createNote, openNoteAfterImport } from "./notes";
import { getCreatorFullNames } from "./creators";
import { Reference } from "./types";
import {
    getNoteTitle,
    orderByDateModified,
    resolvePath,
    truncate,
} from "./utils";

export class fuzzySelectReference extends FuzzySuggestModal<Reference> {
    plugin: ZoteroAnnotations;
    selectArray: Reference[];
    data: {
        collections: Record<string, never>;
        config: Record<string, never>;
        items: Reference[];
        version: string;
        __proto__: Record<string, never>;
    };

    constructor(app: App, plugin: ZoteroAnnotations) {
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

        // Load the JSON file
        // Check if the file exists
        const jsonPath = resolvePath(this.plugin.settings.bibPath)
        if (!fs.existsSync(jsonPath)) {
            new Notice("No BetterBibTeX JSON file found at " + jsonPath);
        }

        //Create the full path to the json file
        const rawdata = fs.readFileSync(jsonPath)
        const data = JSON.parse(rawdata.toString())


        const bibtexArray: Reference[] = [];
        for (let index = 0; index < data.items.length; index++) {
            const selectedEntry: Reference = data.items[index];
            const bibtexArrayItem = {} as Reference;

            //Extract the citation key. If the citationkey does not exist skip
            if (selectedEntry.hasOwnProperty("citationKey") == false) continue;
            bibtexArrayItem.citationKey = selectedEntry.citationKey;

            //Extract the title key
            const truncateTitle = truncate(selectedEntry.title, 120);
            selectedEntry.title = truncateTitle;
            bibtexArrayItem.title = selectedEntry.title;

            // Extract the date
            bibtexArrayItem.date = selectedEntry.date;
            if (selectedEntry.hasOwnProperty("date")) {
                //@ts-ignore
                selectedEntry.year = selectedEntry.date.match(/\d\d\d\d/gm);
                bibtexArrayItem.date = selectedEntry.year;
            }

            //Extract the author
            bibtexArrayItem.authorKey = getCreatorFullNames(selectedEntry.creators);

            //Extract the date the entry was modified
            bibtexArrayItem.dateModified = selectedEntry.dateModified;

            //Create the reference
            bibtexArrayItem.inlineReference = bibtexArrayItem.authorKey +
                bibtexArrayItem.date +
                bibtexArrayItem.title + 
                bibtexArrayItem.citationKey;

            bibtexArray.push(bibtexArrayItem);
        }
        // Order the suggestions from the one modified most recently
        bibtexArray.sort(orderByDateModified);

        this.selectArray = bibtexArray;
        await this.updateSuggestions();
        this.data = data;
    }
    // Returns all available suggestions.
    getItems(): Reference[] {
        return this.selectArray;
    }

    // Renders each suggestion item.
    getItemText(referenceSelected: Reference): string {
        return referenceSelected.inlineReference;
    }
    async updateSuggestions() {
        // @ts-ignore: not exposed in API.
        await super.updateSuggestions();
    }

    renderSuggestion(match: FuzzyMatch<Reference>, el: HTMLElement): void {
        el.empty();
        const entry = match.item;
        const entryTitle = entry.title || '';

        const container = el.createEl('div', { cls: 'zaModalResult' });
        const titleEl = container.createEl('span', {
            cls: 'zaTitle',
        });
        const authorsCls = entry.authorKey
            ? 'zaAuthors'
            : 'zaAuthors zaAuthorsEmpty';
        const authorsEl = container.createEl('span', {
            cls: authorsCls,
        });
        container.createEl('span', { cls: 'zaCitekey', text: entry.citationKey });



        const allMatches = match.match.matches;

        const shiftMatches = (
            matches: SearchMatches,
            start: number,
            end: number,
        ) => {
            return matches
                .map((match: SearchMatchPart) => {
                    const [matchStart, matchEnd] = match;
                    return [
                        matchStart - start,
                        Math.min(matchEnd - start, end),
                    ] as SearchMatchPart;
                })
                .filter((match: SearchMatchPart) => {
                    const [matchStart, matchEnd] = match;
                    return matchStart >= 0;
                });
        };

        // Now highlight matched strings within each element
        renderMatches(
            titleEl,
            entryTitle,
            shiftMatches(allMatches, 0, entryTitle.length),
        );
        if (entry.authorKey) {
            renderMatches(
                authorsEl,
                entry.authorKey,
                shiftMatches(allMatches, 0, entry.authorKey.length),
            );
        }
    }

    // Perform action on the selected suggestion.
    async onChooseItem(
        referenceSelected: Reference,
        evt: MouseEvent | KeyboardEvent
    ) {
        //Create an array where you store the citekey to be processed
        let citeKeyItem: string[] = [];
        citeKeyItem.push(referenceSelected.citationKey);

        // Loop to process the selected note
        for (let index = 0; index < citeKeyItem.length; index++) {
            //Find the index of the reference selected
            const referenceItem = this.data.items.findIndex(
                (item: { citationKey: string }) =>
                    item.citationKey ===
                    citeKeyItem[index]
            );

            //Selected Reference
            const selectedEntry: Reference = this.data.items[referenceItem];
            //Create and export Note for select reference
            createNote(selectedEntry, this.plugin.settings)
            //open note  after import
            const noteTitle = getNoteTitle(selectedEntry, this.plugin.settings.importFileName);
            const myFile = this.app.metadataCache.getFirstLinkpathDest(normalizePath(noteTitle), "")
            openNoteAfterImport(myFile, this.plugin.settings.openAfterImport)
        }
    }
}

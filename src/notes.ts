//Solution copied from obsidian-bibnotes: https://github.com/stefanopagliari/bibnotes/blob/master/src/main.ts


import { Notice, TFile, WorkspaceLeaf } from "obsidian";
import * as fs from "fs";
import { Reference, ZoteroAnnotationsSettings } from "./types";
import { extractAnnotation, parseMetadata } from "./parser";
import { getCreatorFullInitials, getCreatorFullNames, getCreatorKey } from "./creators";
import {
    createNotePath,
    getNoteTitle,
    importTemplate,
    insertKeywordList,
    replaceMissingFields,
    resolvePath
} from "./utils";

export function openNoteAfterImport(file: TFile, isOpen: boolean) {
    let leaf: WorkspaceLeaf;
    leaf = this.app.workspace.getLeaf(false);
    if (isOpen) leaf.openFile(file);
}

export function compareOldNewNote(
    existingNote: string,
    newNote: string,
    authorKey: string,
    settings: ZoteroAnnotationsSettings
) {
    //Find the position of the line breaks in the old note
    const newLineRegex = RegExp(/\n/gm);
    const positionNewLine: number[] = [];
    let match = undefined;
    while ((match = newLineRegex.exec(existingNote))) { positionNewLine.push(match.index); }
    //Create an array to record where in the old 
    // note the matches with the new note are found
    const positionOldNote: number[] = [0];
    //Create an array to record which sentences of the new note need to be 
    // stored in the old note and their position in the old note
    const newNoteInsertText: string[] = [];
    const newNoteInsertPosition: number[] = [];
    //Split the new note into sentences
    const newNoteArray = newNote.split("\n");
    //Remove markdown formatting from the beginning and end of each line
    //loop through each of the lines extracted in the note
    for (let indexLines = 0; indexLines < newNoteArray.length; indexLines++) {
        let segmentWhole = "";
        let segmentFirstHalf = "";
        let segmentSecondHalf = "";
        let segmentFirstQuarter = "";
        let segmentSecondQuarter = "";
        let segmentThirdQuarter = "";
        let segmentFourthQuarter = "";
        //Create an array to record where in the old note the matches with the new note are found
        const positionArray: number[] = [-1];

        // Select the line to be searched
        //Remove formatting added by bibnotes at the beginning of the line
        let selectedNewLine = newNoteArray[indexLines];
        selectedNewLine = selectedNewLine.trim();
        selectedNewLine = selectedNewLine.replace(/^- /gm, "");
        selectedNewLine = selectedNewLine.replace(/^> /gm, "");
        selectedNewLine = selectedNewLine.replace(/^=/gm, "");
        selectedNewLine = selectedNewLine.replace(/^\**/gm, "");
        selectedNewLine = selectedNewLine.replace(/^\*/gm, "");
        selectedNewLine = selectedNewLine.replace(/^"/gm, "");

        //Remove the authorkey at the end of the line
        const authorKey_Zotero = new RegExp("\\(" + authorKey + ", \\d+, p. \\d+\\)$");
        const authorKey_Zotfile = new RegExp("\\(" + authorKey + " \\d+:\\d+\\)$");
        selectedNewLine = selectedNewLine.replace(authorKey_Zotero, "");
        selectedNewLine = selectedNewLine.replace(authorKey_Zotfile, "");

        //Remove formatting added by bibnotes at the end of the line
        selectedNewLine = selectedNewLine.replace(/=$/gm, "");
        selectedNewLine = selectedNewLine.replace(/\**$/gm, "");
        selectedNewLine = selectedNewLine.replace(/\*$/gm, "");
        selectedNewLine = selectedNewLine.replace(/"$/gm, "");

        //Calculate the length of the highlighted text
        if (selectedNewLine == undefined) continue;

        const lengthExistingLine = selectedNewLine.length;
        //Calculate the length of the comment text
        if (lengthExistingLine === 0) continue;

        //CHECK THE PRESENCE OF THE HIGHLIGHTED TEXT IN THE EXISTING ONE

        //Check if the entire line (or part of the line for longer lines)
        // are found in the existing note
        if (lengthExistingLine > 1 && lengthExistingLine < 30) {
            segmentWhole = selectedNewLine;
            positionArray.push(existingNote.indexOf(segmentWhole));
        } else if (lengthExistingLine >= 30 && lengthExistingLine < 150) {
            segmentFirstHalf = selectedNewLine.substring(0, lengthExistingLine / 2);
            positionArray.push(existingNote.indexOf(segmentFirstHalf));
            segmentSecondHalf = selectedNewLine.substring(lengthExistingLine / 2 + 1, lengthExistingLine);
            positionArray.push(existingNote.indexOf(segmentSecondHalf));
        } else if (lengthExistingLine >= 150) {
            segmentFirstQuarter = selectedNewLine.substring(0, lengthExistingLine / 4);
            positionArray.push(existingNote.indexOf(segmentFirstQuarter));
            segmentSecondQuarter = selectedNewLine.substring(lengthExistingLine / 4 + 1, lengthExistingLine / 2);
            positionArray.push(existingNote.indexOf(segmentSecondQuarter));
            segmentThirdQuarter = selectedNewLine.substring(lengthExistingLine / 2 + 1, (3 * lengthExistingLine) / 4);
            positionArray.push(existingNote.indexOf(segmentThirdQuarter));
            segmentFourthQuarter = selectedNewLine.substring((3 * lengthExistingLine) / 4 + 1, lengthExistingLine);
            positionArray.push(existingNote.indexOf(segmentFourthQuarter));
        }

        // if a match if found with the old note, set foundOld to TRUE
        if (Math.max(...positionArray) > -1) {
            //record the position of the found line in the old note
            const positionOldNoteMax = Math.max(...positionArray);
            positionOldNote.push(positionOldNoteMax);
        }
        // if a match if not found with the old note, set foundOld to FALSE and set 
        // positionOld to the position in the old note where the line break is found
        if (Math.max(...positionArray) === -1) {
            const positionOldNoteMax = Math.max(...positionOldNote);
            newNoteInsertText.push(newNoteArray[indexLines]);
            newNoteInsertPosition.push(
                positionNewLine.filter((pos) => pos > positionOldNoteMax)[0]
            );
        }
    }

    let doubleSpaceAdd = "";
    if (settings.isDoubleSpaced) doubleSpaceAdd = "\n";

    //Add the new annotations into the old note
    for (
        let indexNoteElements = newNoteInsertText.length - 1;
        indexNoteElements >= 0;
        indexNoteElements--
    ) {
        const insertText = newNoteInsertText[indexNoteElements];
        const insertPosition = newNoteInsertPosition[indexNoteElements];
        existingNote = existingNote.slice(0, insertPosition) +
            doubleSpaceAdd + "\n" + insertText +
            existingNote.slice(insertPosition);
    }
    if (settings.saveManualEdits == "Save Entire Note") return existingNote
    if (settings.saveManualEdits == "Select Section") {
        //identify the keyword marking the beginning and the end of the section not to be overwritten
        const startSave = settings.saveManualEditsStart;
        const endSave = settings.saveManualEditsEnd;
        //identify the keyword identifying the beginning of the section to be preserved is empty, 
        // the position is the beginning of the string. Otherwise find the match in the text
        let startSaveOld = 0;
        if (startSave !== "") startSaveOld = existingNote.indexOf(startSave)
        if (startSaveOld < 0) startSaveOld = 0

        //identify the keyword identifying the end of the section to be preserved. 
        // If is empty, the position is the end of the string. Otherwise find the match in the text
        let endSaveOld: number = existingNote.length;
        if (endSave !== "") endSaveOld = existingNote.indexOf(endSave) + endSave.length
        if (endSaveOld < 0) endSaveOld = existingNote.length

        //Find the sections of the existing note to be preserved
        const existingNotePreserved = existingNote.substring(startSaveOld, endSaveOld);
        //identify the keyword identifying the beginning of the section to be preserved is empty, 
        // the position is the beginning of the string. Otherwise find the match in the text
        let startSaveNew = 0;
        if (startSave !== "") startSaveNew = newNote.indexOf(startSave)
        if (startSaveNew < 0) startSaveNew = 0
        //identify the keyword identifying the ebd of the section to be preserved is empty, 
        // the position is the end of the string. Otherwise find the match in the text
        let endSaveNew: number = newNote.length;
        if (endSave !== "") endSaveNew = newNote.indexOf(endSave) + endSave.length;
        if (endSaveNew < 0) endSaveNew = newNote.length

        //Find the sections of the existing note before the one to be preserved
        const newNotePreservedBefore = newNote.substring(0, startSaveNew);
        //Find the sections of the existing note after the one to be preserved
        const newNotePreservedAfter = newNote.substring(endSaveNew, newNote.length)
        const newNoteCombined = newNotePreservedBefore + existingNotePreserved + newNotePreservedAfter;

        return newNoteCombined;
    }
}


export async function createNote(
    selectedEntry: Reference,
    settings: ZoteroAnnotationsSettings
): Promise<void> {
    // Extract the reference within bracket to faciliate comparison
    const authorKey = getCreatorKey(selectedEntry.creators);
    // set the authorkey field (with or without first name) on the 
    // entry to use when creating the title and to replace in the template
    selectedEntry.authorKey = authorKey;
    selectedEntry.authorKeyInitials = getCreatorFullInitials(selectedEntry.creators);
    selectedEntry.authorKeyFullName = getCreatorFullNames(selectedEntry.creators);

    // Load Template
    const templateNote = await importTemplate(settings);
    // Create the metadata
    let litnote: string = parseMetadata(selectedEntry, settings, templateNote);
    // Define the name and full path of the file to be exported
    const noteTitle = getNoteTitle(selectedEntry, settings.importFileName,);
    const notePath = createNotePath(noteTitle, settings.importPath)
    // Extract the annotation and the keyword from the text
    const resultAnnotations = extractAnnotation(selectedEntry, settings);
    // Replace annotations in the template
    litnote = litnote.replace("{{PDFNotes}}", resultAnnotations.extractedAnnotations);
    litnote = litnote.replace("{{UserNotes}}", resultAnnotations.extractedUserNote);
    litnote = litnote.replace("{{Images}}", resultAnnotations.extractedImages);
    let extractedKeywords = resultAnnotations.extractedKeywords;
    if (extractedKeywords == undefined) { extractedKeywords = []; }

    // Join the tags in the metadata with the tags extracted in the text and replace them in the text
    litnote = insertKeywordList(selectedEntry, extractedKeywords, litnote, settings.multipleFieldsDivider);
    // delete the missing fields in the metadata
    const missingFieldSetting = settings.missingfield;
    litnote = replaceMissingFields(litnote, missingFieldSetting, settings.missingfieldreplacement);
    // Compare old note and new note
    // Check the option in settings.saveManualEdits.
    if (settings.saveManualEdits !== "Overwrite Entire Note" && fs.existsSync(notePath)) {
        // In that case compare existing file with new notes. If false don't look at existing note
        // Check if an old version exists. If the old version has annotations then add the new annotation to the old annotaiton
        const existingNoteAll = String(fs.readFileSync(notePath));
        litnote = compareOldNewNote(existingNoteAll, litnote, authorKey, settings);
    }
    fs.writeFile(notePath, litnote, err => {
        if (err) {
            console.error(err);
            return;
        }
        new Notice(`Imported ${selectedEntry.citationKey}`);
    });
}


export function updateNotes(settings: ZoteroAnnotationsSettings) {
    // console.log("Updating Zotero library");
    // Check if the json file exists
    const jsonPath = resolvePath(settings.bibPath)
    if (!fs.existsSync(jsonPath)) new Notice("No BetterBibTex Json file found at " + jsonPath);
    const rawdata = fs.readFileSync(jsonPath);
    const data = JSON.parse(rawdata.toString()); // rawdata is a buffer, converted to string

    const bibtexArray: string[] = [];
    // Check the last time the library was updated
    const lastUpdate = new Date(settings.lastUpdateDate);
    // loop through all the entries in the bibliography to find out which ...
    //... ones have been modified since the last time the library on obsidian was updated.
    for (let index = 0; index < data.items.length; index++) {
        const selectedEntry: Reference = data.items[index];
        const bibtexArrayItem = {} as Reference;

        // Extract the citation key. If the citationkey does not exist skip
        if (selectedEntry.hasOwnProperty("citationKey") == false) continue;
        bibtexArrayItem.citationKey = selectedEntry.citationKey;

        // Extract the date the entry was modified
        const noteDateModifiedArray = [];
        noteDateModifiedArray.push(selectedEntry.dateModified);
        for (let index = 0; index < selectedEntry.notes.length; index++) {
            noteDateModifiedArray.push(selectedEntry.notes[index].dateModified);
            noteDateModifiedArray.sort((firstElement, secondElement) => {
                if (firstElement > secondElement) return -1
                if (firstElement < secondElement) return 1
                return 0;
            });
        }

        const datemodified = new Date(noteDateModifiedArray[0]);
        // skip if it was modified before the last update
        if (datemodified < lastUpdate) continue;
        // skip if the setting is to update only existing note and the note is not found at the give folder
        const noteTitle = getNoteTitle(selectedEntry, settings.importFileName)
        const notePath = createNotePath(noteTitle, settings.importPath)
        if (settings.updateNotes === "Only existing notes" && !fs.existsSync(notePath)) continue;
        // Create and export Note for select reference
        createNote(selectedEntry, settings);
        bibtexArray.push(selectedEntry.citationKey);
    }

    new Notice("Updated " + bibtexArray.length + " entries");
    //Update the date when the update was last done
    settings.lastUpdateDate = new Date();
};
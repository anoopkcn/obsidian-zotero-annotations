import { FileSystemAdapter, Notice, TFile, normalizePath } from "obsidian";
import * as fs from "fs";
import path from "path";
import {
    Creator,
    CreatorArray,
    ZoteroAnnotationsPluginSettings,
    Reference,
} from "./types";


import { TEMPLATE_BRACKET_REG, TEMPLATE_REG, templatePlain } from "./constants";
import { extractAnnotation, parseMetadata } from "./parser";

export function resolvePath(rawPath: string): string {
    const vaultRoot =
        this.app.vault.adapter instanceof FileSystemAdapter
            ? this.app.vault.adapter.getBasePath()
            : '/';
    return path.normalize(path.resolve(vaultRoot, rawPath))
}

// convert camelCase to Normal Case
export function camelToNormalCase(str: string) {
    return (
        str.replace(/([A-Z])/g, " $1")
            .replace(/^./, function (str) {
                return str.toUpperCase();
            })
    );
}

// Cleanup title of the document (remove URL, remove special characters)
export function truncate(str: string, n: number) {
    var str = str.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/[^\x00-\x7F]/g, "");
    return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
};


// import template from file if present or set it to the default template
export async function importTemplate(settings: ZoteroAnnotationsPluginSettings): Promise<string> {
    const template = this.app.metadataCache.getFirstLinkpathDest(
        normalizePath(settings.templatePath),
        ""
    );
    if (template && template instanceof TFile) {
        const data = await this.app.vault.read(template);
        return data;
    } else {
        return templatePlain;
    }
}

export function replaceAllTemplates(
    entriesArray: string[],
    note: string,
    selectedEntry: Reference
) {
    let copy = note.slice();
    for (let z = 0; z < entriesArray.length; z++) {
        // 	 Identify the keyword to be replaced
        const KW = entriesArray[z];
        const KW_Brackets = "{{" + KW + "}}";
        // 	 replace the keyword in the template
        copy = replaceTemplate(
            copy,
            KW_Brackets,
            `${selectedEntry[KW as keyof Reference]}`
        ); // fixed the type
    }
    return copy;
}

export function escapeRegExp(stringAdd: string) {
    return stringAdd.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
}

export function replaceTemplate(
    stringAdd: string,
    find: string,
    replace: string
) {
    return stringAdd.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

export const makeWiki = (str: string) => "[[" + str + "]]";
export const makeQuotes = (str: string) => '"' + str + '"';
export const makeTags = (str: string) => "#" + str;

export const createAuthorKey = (creators: CreatorArray) => {
    const authorKey: string[] = [];
    const editorKey: string[] = [];
    let authorKeyFixed = "";
    let editorKeyFixed = "";
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex];

        if (creator.creatorType === "author") {
            if (creator.hasOwnProperty("name")) {
                //authorList.push(creator.name)
                authorKey.push(creator.name);
            } else if (
                creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                //authorList.push(creator.lastName + ", " + creator.firstName)
                authorKey.push(creator.lastName);
            } else if (
                creator.hasOwnProperty("lastName") &&
                !creator.hasOwnProperty("firstName")
            ) {
                //authorList.push(creator.lastName)
                authorKey.push(creator.lastName);
            } else if (
                !creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                //authorList.push(creator.firstName)
                authorKey.push(creator.firstName);
            }
        } else if (creator.creatorType === "editor") {
            if (creator.hasOwnProperty("name")) {
                //editorList.push(creator.name)
                editorKey.push(creator.name);
            } else if (
                creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                //editorList.push(creator.lastName + ", " + creator.firstName)
                editorKey.push(creator.lastName);
            } else if (
                creator.hasOwnProperty("lastName") &&
                !creator.hasOwnProperty("firstName")
            ) {
                //editorList.push(creator.lastName)
                editorKey.push(creator.lastName);
            } else if (
                !creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                //editorList.push(creator.firstName)
                editorKey.push(creator.firstName);
            }
        }
    }

    //Adjust the authorKey depending on the number of authors

    if (authorKey.length == 1) {
        authorKeyFixed = authorKey[0];
    }
    if (authorKey.length == 2) {
        authorKeyFixed = authorKey[0] + " and " + authorKey[1];
    }

    if (authorKey.length == 3) {
        authorKeyFixed =
            authorKey[0] + ", " + authorKey[1] + " and " + authorKey[2];
    }

    if (authorKey.length > 3) {
        authorKeyFixed = authorKey[0] + " et al.";
    }
    if (authorKey.length > 0) {
        return authorKeyFixed;
    }

    //If there are no authors (because it is an edited book), 
    // then returns the name of the editors
    if (editorKey.length == 1) {
        editorKeyFixed = editorKey[0];
    }
    if (editorKey.length == 2) {
        editorKeyFixed = editorKey[0] + " and " + editorKey[1];
    }

    if (editorKey.length == 3) {
        editorKeyFixed =
            editorKey[0] + ", " + editorKey[1] + " and " + editorKey[2];
    }

    if (authorKey.length > 3) {
        editorKeyFixed = editorKey[0] + " et al.";
    }
    if (editorKey.length > 0) {
        return editorKeyFixed;
    }
};

export const createAuthorKeyFullName = (creators: CreatorArray) => {
    const authorKey: string[] = [];
    const authorKeyReverse: string[] = [];
    const editorKey: string[] = [];
    const editorKeyReverse: string[] = [];

    let authorKeyFixed = "";
    let editorKeyFixed = "";
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex]; //select the author
        if (creator.creatorType === "author") {
            if (creator.hasOwnProperty("name")) {
                //authorList.push(creator.name)
                authorKey.push(creator.name);
            } else if (
                creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                authorKey.push(creator.lastName + ", " + creator.firstName);
                authorKeyReverse.push(
                    creator.firstName + " " + creator.lastName
                );
            } else if (
                creator.hasOwnProperty("lastName") &&
                !creator.hasOwnProperty("firstName")
            ) {
                //authorList.push(creator.lastName)
                authorKey.push(creator.lastName);
            } else if (
                !creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                //authorList.push(creator.firstName)
                authorKey.push(creator.firstName);
            }
        } else if (creator.creatorType === "editor") {
            if (creator.hasOwnProperty("name")) {
                //editorList.push(creator.name)
                editorKey.push(creator.name);
            } else if (
                creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                editorKey.push(creator.lastName + ", " + creator.firstName);
                editorKeyReverse.push(
                    creator.firstName + " " + creator.lastName
                );
            } else if (
                creator.hasOwnProperty("lastName") &&
                !creator.hasOwnProperty("firstName")
            ) {
                //editorList.push(creator.lastName)
                editorKey.push(creator.lastName);
            } else if (
                !creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                //editorList.push(creator.firstName)
                editorKey.push(creator.firstName);
            }
        }
    }

    //Adjust the authorKey depending on the number of authors

    if (authorKey.length == 1) {
        authorKeyFixed = authorKey[0];
    }
    if (authorKey.length == 2) {
        authorKeyFixed = authorKey[0] + " and " + authorKeyReverse[1];
    }

    if (authorKey.length == 3) {
        authorKeyFixed =
            authorKey[0] +
            ", " +
            authorKeyReverse[1] +
            " and " +
            authorKeyReverse[2];
    }

    if (authorKey.length > 3) {
        authorKeyFixed = authorKey[0] + " et al.";
    }

    if (authorKey.length > 0) {
        return authorKeyFixed;
    }

    //If there are no authors (because it is an edited book), 
    // then returns the name of the editors
    if (editorKey.length == 1) {
        editorKeyFixed = editorKey[0];
    }
    if (editorKey.length == 2) {
        editorKeyFixed = editorKey[0] + " and " + editorKeyReverse[1];
    }

    if (editorKey.length == 3) {
        editorKeyFixed =
            editorKey[0] +
            ", " +
            editorKeyReverse[1] +
            " and " +
            editorKeyReverse[2];
    }

    if (authorKey.length > 3) {
        editorKeyFixed = editorKey[0] + " et al.";
    }
    if (editorKey.length > 0) {
        return editorKeyFixed;
    }
};

export const createAuthorKeyInitials = (creators: CreatorArray) => {
    const authorKey: string[] = [];
    const editorKey: string[] = [];
    let authorKeyFixed = "";
    let editorKeyFixed = "";
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex]; //select the author
        if (creator.creatorType === "author") {
            if (creator.hasOwnProperty("name")) {
                //authorList.push(creator.name)
                authorKey.push(creator.name);
            } else if (
                creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                authorKey.push(
                    creator.lastName +
                    ", " +
                    creator.firstName.substring(0, 1) +
                    "."
                );
            } else if (
                creator.hasOwnProperty("lastName") &&
                !creator.hasOwnProperty("firstName")
            ) {
                //authorList.push(creator.lastName)
                authorKey.push(creator.lastName);
            } else if (
                !creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                //authorList.push(creator.firstName)
                authorKey.push(creator.firstName);
            }
        } else if (creator.creatorType === "editor") {
            if (creator.hasOwnProperty("name")) {
                //editorList.push(creator.name)
                editorKey.push(creator.name);
            } else if (
                creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                editorKey.push(
                    creator.lastName +
                    ", " +
                    creator.firstName.substring(0, 1) +
                    "."
                );
            } else if (
                creator.hasOwnProperty("lastName") &&
                !creator.hasOwnProperty("firstName")
            ) {
                //editorList.push(creator.lastName)
                editorKey.push(creator.lastName);
            } else if (
                !creator.hasOwnProperty("lastName") &&
                creator.hasOwnProperty("firstName")
            ) {
                //editorList.push(creator.firstName)
                editorKey.push(creator.firstName);
            }
        }
    }

    //Adjust the authorKey depending on the number of authors

    if (authorKey.length == 1) {
        authorKeyFixed = authorKey[0];
    }
    if (authorKey.length == 2) {
        authorKeyFixed = authorKey[0] + " and " + authorKey[1];
    }

    if (authorKey.length == 3) {
        authorKeyFixed =
            authorKey[0] + ", " + authorKey[1] + " and " + authorKey[2];
    }

    if (authorKey.length > 3) {
        authorKeyFixed = authorKey[0] + " et al.";
    }
    if (authorKey.length > 0) {
        return authorKeyFixed;
    }

    //If there are no authors (because it is an edited book), 
    // then returns the name of the editors
    if (editorKey.length == 1) {
        editorKeyFixed = editorKey[0];
    }
    if (editorKey.length == 2) {
        editorKeyFixed = editorKey[0] + " and " + editorKey[1];
    }

    if (editorKey.length == 3) {
        editorKeyFixed =
            editorKey[0] + ", " + editorKey[1] + " and " + editorKey[2];
    }

    if (authorKey.length > 3) {
        editorKeyFixed = editorKey[0] + " et al.";
    }
    if (editorKey.length > 0) {
        return editorKeyFixed;
    }
};

export function removeQuoteFromStart(quote: string, annotation: string) {
    let copy = annotation.slice();
    while (copy.charAt(0) === quote) copy = copy.substring(1);
    return copy;
}
export function removeQuoteFromEnd(quote: string, annotation: string) {
    let copy = annotation.slice();
    while (copy[copy.length - 1] === quote)
        copy = copy.substring(0, copy.length - 1);
    return copy;
}

export function orderByDateModified(a: Reference, b: Reference) {
    if (a.dateModified > b.dateModified) {
        return -1;
    }
    if (a.dateModified < b.dateModified) {
        return 1;
    }
    return 0;
}

export function formatCreatorsName(creator: Creator, nameCustom: string) {
    // when the creator only has a name (no first or last name) this works just fine
    if (creator.hasOwnProperty("name")) {
        nameCustom = creator.name;
        nameCustom = nameCustom.trim();
        return nameCustom;
    } else if (
        creator.hasOwnProperty("lastName") &&
        creator.hasOwnProperty("firstName")
    ) {
        nameCustom = nameCustom.replace("{{lastName}}", creator.lastName);
        nameCustom = nameCustom.replace("{{firstName}}", creator.firstName);
        const getInitials = function (string: string) {
            let names = string.split(" "),
                initials = names[0].substring(0, 1).toUpperCase() + ".";
            if (names.length > 1) {
                initials +=
                    names[names.length - 1].substring(0, 1).toUpperCase() + ".";
            }
            return initials;
        };

        nameCustom = nameCustom.replace(
            "{{firstNameInitials}}",
            getInitials(creator.firstName)
        );
        nameCustom = nameCustom.trim();
        return nameCustom;
    } else if (
        creator.hasOwnProperty("lastName") &&
        !creator.hasOwnProperty("firstName")
    ) {
        nameCustom = nameCustom.replace("{{lastName}}", creator.lastName);
        nameCustom = nameCustom.replace("; {{firstName}}", creator.firstName);
        nameCustom = nameCustom.replace(", {{firstName}}", creator.firstName);
        nameCustom = nameCustom.replace("{{firstName}}", "");
        nameCustom = nameCustom.trim();
        return nameCustom;
    } else if (
        !creator.hasOwnProperty("lastName") &&
        creator.hasOwnProperty("firstName")
    ) {
        nameCustom = nameCustom.replace("; {{lastName}}", creator.firstName);
        nameCustom = nameCustom.replace(", {{lastName}}", creator.firstName);
        nameCustom = nameCustom.replace("{{lastName}}", "");
        nameCustom = nameCustom.replace("{{firstName}}", creator.firstName);
        nameCustom = nameCustom.trim();
        return nameCustom;
    }
}

//Function that create an array with the creators of a given type (e.g. author, editor)
export const createCreatorList = (
    creators: CreatorArray,
    typeCreator: string,
    note: string,
    divider: string,
    nameFormat: string
) => {
    const creatorList: string[] = [];
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex]; //select the author
        if (creator.creatorType === typeCreator) {
            creatorList.push(formatCreatorsName(creator, nameFormat));
        }
    }

    const creatorListBracket = creatorList.map(makeWiki);

    const creatorListQuotes = creatorList.map(makeQuotes);

    //add a space after the divided if it is not present
    if (divider.slice(-1) !== " ") {
        divider = divider + " ";
    }

    if (creatorList.length == 0) {
        return note;
    } else {
        note = replaceTemplate(
            note,
            `[[{{${typeCreator}}}]]`,
            creatorListBracket.join(divider)
        );
        note = replaceTemplate(
            note,
            `"{{${typeCreator}}}"`,
            creatorListQuotes.join(divider)
        );
        note = replaceTemplate(
            note,
            `{{${typeCreator}}}`,
            creatorList.join(divider)
        );

        return note;
    }
};

export const createCreatorAllList = (
    creators: CreatorArray,
    note: string,
    divider: string,
    nameFormat: string
) => {
    const creatorList: string[] = [];
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex]; //select the author
        creatorList.push(formatCreatorsName(creator, nameFormat));
    }

    const creatorListBracket = creatorList.map(makeWiki);
    const creatorListQuotes = creatorList.map(makeQuotes);

    //add a space after the divided if it is not present
    if (divider.slice(-1) !== " ") {
        divider = divider + " ";
    }

    if (creatorList.length == 0) {
        return note;
    } else {
        note = replaceTemplate(
            note,
            `[[{{creator}}]]`,
            creatorListBracket.join(divider)
        );
        note = replaceTemplate(
            note,
            `"{{creator}}"`,
            creatorListQuotes.join(divider)
        );
        note = replaceTemplate(note, `{{creator}}`, creatorList.join(divider));
        note = replaceTemplate(note, `{{Creator}}`, creatorList.join(divider));

        return note;
    }
};

export function createTagList(tagList: string[], note: string) {
    if (tagList.length == 0) {
        return note;
    } else {
        const tagListBraket = tagList.map(makeWiki);
        note = replaceTemplate(
            note,
            `[[{{keywords}}]]`,
            String(tagListBraket.join("; "))
        );
        note = replaceTemplate(
            note,
            `{{keywords}}`,
            String(tagList.join("; "))
        );
        return note;
    }
}

//function to replace the missing fields in the template
export function replaceMissingFields(
    note: string,
    missingfield: string,
    missingfieldreplacement: string
) {
    let copy = note.slice();
    if (missingfield === "Replace with custom text") {
        copy = copy
            .replace(TEMPLATE_BRACKET_REG, missingfieldreplacement)
            .trim();
        copy = copy.replace(TEMPLATE_REG, missingfieldreplacement).trim();
    } else if (missingfield === "Remove (entire row)") {
        const lines = copy.split(/\r?\n/);
        // 	run function to determine where we still have double curly brackets
        for (let j = 0; j < lines.length; j++) {
            if (lines[j].match(TEMPLATE_REG)) {
                lines.splice(j, 1);
                j--;
            }
        }
        copy = lines.join("\n");
    }

    //Remove empty sections when there is no data
    copy = copy.replace(
        "## Abstract\n" + "\n" + "## Files and Links\n",
        "## Files and Links\n"
    );
    copy = copy.replace(
        "## Files and Links\n" + "\n" + "## Zotero Tags\n",
        "## Zotero Tags\n"
    );
    copy = copy.replace("## Zotero Tags\n" + "\n", "\n");

    return copy;
}

export function createLocalFileLink(reference: Reference) {
    //if there is no attachment, return placeholder
    if (reference.attachments.length == 0) return "{{localFile}}";
    const filesList: string[] = [];

    for (
        let attachmentindex = 0;
        attachmentindex < reference.attachments.length;
        attachmentindex++
    ) {
        if (reference.attachments[attachmentindex].itemType !== "attachment")
            continue;

        //remove white spaces from file name
        if (reference.attachments[attachmentindex].path == undefined) {
            reference.attachments[attachmentindex].path = "";
        }

        const selectedfile: string =
            "[" +
            reference.attachments[attachmentindex].title +
            "](file:///" + // added an extra "/" to make it work on Linux
            encodeURI(
                reference.attachments[attachmentindex].path.replaceAll(" ", " ")
            ) +
            ")"; //select the author

        filesList.push(selectedfile);
    }
    //turn the array into a string
    const filesListString = filesList.join("; ");
    return filesListString;
}

export function createNoteTitle(
    selectedEntry: Reference,
    exportTitle: string
) {
    //Replace the placeholders
    exportTitle = exportTitle
        .replaceAll("{{citeKey}}", selectedEntry.citationKey)
        .replaceAll("{{citationKey}}", selectedEntry.citationKey)
        .replaceAll("{{title}}", selectedEntry.title)
        .replaceAll("{{author}}", selectedEntry.authorKey)
        .replaceAll("{{authors}}", selectedEntry.authorKey)
        .replaceAll("{{authorInitials}}", selectedEntry.authorKeyInitials)
        .replaceAll("{{authorsInitials}}", selectedEntry.authorKeyInitials)
        .replaceAll("{{authorFullName}}", selectedEntry.authorKeyFullName)
        .replaceAll("{{authorsFullName}}", selectedEntry.authorKeyFullName)
        .replaceAll("{{year}}", selectedEntry.year)
        .replaceAll("{{date}}", selectedEntry.year)
        .replace(/[/\\?%*:|"<>]/g, "");

    return exportTitle;
}

export function createNotePath(noteTitle: string, exportPath: string) {
    return resolvePath(`${exportPath}/${noteTitle}.md`)
}

export function replaceTagList(
    selectedEntry: Reference,
    arrayExtractedKeywords: string[],
    metadata: string,
    divider: string
) {
    // Copy the keywords extracted by Zotero and store them in an array
    selectedEntry.zoteroTags = [];
    if (selectedEntry.tags.length > 0) {
        for (
            let indexTag = 0;
            indexTag < selectedEntry.tags.length;
            indexTag++
        ) {
            selectedEntry.zoteroTags.push(selectedEntry.tags[indexTag].tag);
        }
    }

    //add a space after the divided if it is not present
    if (divider.slice(-1) !== " ") {
        divider = divider + " ";
    }

    //Create three arrays for the tags from the metadata, 
    // tags exported from the text and tags combined
    const tagsZotero = selectedEntry.zoteroTags.sort();
    const tagsPDF = arrayExtractedKeywords.sort();
    const tagsCombined = tagsZotero.concat(tagsPDF).sort();

    //metadata = createTagList(selectedEntry.zoteroTags, metadata)

    //Replace in the text the tags extracted by Zotero
    if (tagsZotero.length > 0) {
        const tagsZoteroBracket = tagsZotero.map(makeWiki);
        metadata = replaceTemplate(
            metadata,
            `[[{{keywordsZotero}}]]`,
            String(tagsZoteroBracket.join(divider))
        );
        const tagsZoteroQuotes = tagsZotero.map(makeQuotes);
        metadata = replaceTemplate(
            metadata,
            `"{{keywordsZotero}}"`,
            String(tagsZoteroQuotes.join(divider))
        );
        const tagsZoteroTags = tagsZotero.map(makeTags);
        metadata = replaceTemplate(
            metadata,
            `#{{keywordsZotero}}`,
            String(tagsZoteroTags.join(divider))
        );

        metadata = replaceTemplate(
            metadata,
            `{{keywordsZotero}}`,
            String(tagsZotero.join(divider))
        );
    }

    //Replace in the text the tags extracted from the PDF
    if (tagsPDF.length > 0) {
        const tagsPDFBracket = tagsPDF.map(makeWiki);
        metadata = replaceTemplate(
            metadata,
            `[[{{keywordsPDF}}]]`,
            String(tagsPDFBracket.join(divider))
        );
        const tagsPDFQuotes = tagsPDF.map(makeQuotes);
        metadata = replaceTemplate(
            metadata,
            `"{{keywordsPDF}}"`,
            String(tagsPDFQuotes.join(divider))
        );
        const tagsPDFTags = tagsPDF.map(makeTags);
        metadata = replaceTemplate(
            metadata,
            `#{{keywordsPDF}}`,
            String(tagsPDFTags.join(divider))
        );
        metadata = replaceTemplate(
            metadata,
            `{{keywordsPDF}}`,
            String(tagsPDF.join(divider))
        );
    }

    //Replace in the text the tags extracted from the PDF 
    // combined with those extracted from the metadata
    if (tagsCombined.length > 0) {
        const tagsCombinedBracket = tagsCombined.map(makeWiki);
        metadata = replaceTemplate(
            metadata,
            `[[{{keywords}}]]`,
            String(tagsCombinedBracket.join(divider))
        );
        metadata = replaceTemplate(
            metadata,
            `[[{{keywordsAll}}]]`,
            String(tagsCombinedBracket.join(divider))
        );

        const tagsCombinedQuotes = tagsCombined.map(makeQuotes);
        metadata = replaceTemplate(
            metadata,
            `"{{keywordsAll}}"`,
            String(tagsCombinedQuotes.join(divider))
        );

        metadata = replaceTemplate(
            metadata,
            `"{{keywords}}"`,
            String(tagsCombinedQuotes.join(divider))
        );

        const tagsCombinedTags = tagsCombined.map(makeTags);
        metadata = replaceTemplate(
            metadata,
            `#{{keywordsAll}}`,
            String(tagsCombinedTags.join(divider))
        );

        metadata = replaceTemplate(
            metadata,
            `#{{keywords}}`,
            String(tagsCombinedTags.join(divider))
        );
        metadata = replaceTemplate(
            metadata,
            `{{keywordsAll}}`,
            String(tagsCombined.join(divider))
        );

        metadata = replaceTemplate(
            metadata,
            `{{keywords}}`,
            String(tagsCombined.join(divider))
        );
    }

    if (selectedEntry.zoteroTags.length == 0) {
        metadata = metadata.replace("# Tags\n", "");
        metadata = metadata.replace("## Tags\n", "");
        metadata = metadata.replace("### Tags\n", "");
    }
    return metadata;
}

export function zoteroAppInfo(selectedEntry: Reference, settings: ZoteroAnnotationsPluginSettings) {

    //Check the path to the data folder
    if (selectedEntry.attachments[0] !== undefined) {
        //identify the folder on the local computer where zotero/storage is found
        //first look into the same path as the pdf attachment
        let pathZoteroStorage = "";
        let zoteroBuildWindows: boolean = undefined;

        //check if the base path where the attachment is stored is in Zotero/storage
        const zoteroStorageMac = new RegExp(
            /.+?(?=Zotero\/storage)Zotero\/storage\//gm
        );

        if (zoteroStorageMac.test(selectedEntry.attachments[0].path)) {
            pathZoteroStorage = String(
                selectedEntry.attachments[0].path.match(zoteroStorageMac)
            );
            zoteroBuildWindows = false;
        }

        const zoteroStorageWindows = new RegExp(
            /.+?(?=Zotero\\storage\\)Zotero\\storage\\/gm
        );

        if (zoteroStorageWindows.test(selectedEntry.attachments[0].path)) {
            pathZoteroStorage = String(
                selectedEntry.attachments[0].path.match(
                    zoteroStorageWindows
                )
            );
            zoteroBuildWindows = true;
        }

        if (
            pathZoteroStorage.length == 0 &&
            settings.zoteroStoragePathManual.length > 0
        ) {
            pathZoteroStorage = settings.zoteroStoragePathManual;
            if (pathZoteroStorage.toLowerCase().endsWith("\\zotero")) {
                pathZoteroStorage = pathZoteroStorage + "\\storage\\";
            }
            if (pathZoteroStorage.toLowerCase().endsWith("\\zotero\\")) {
                pathZoteroStorage = pathZoteroStorage + "storage\\";
            }
            if (pathZoteroStorage.toLowerCase().endsWith("/zotero")) {
                pathZoteroStorage = pathZoteroStorage + "/storage/";
            }
            if (pathZoteroStorage.toLowerCase().endsWith("/zotero/")) {
                pathZoteroStorage = pathZoteroStorage + "storage/";
            }
        }
        const zoteroInfo = {
            pathZoteroStorage: pathZoteroStorage,
            zoteroBuildWindows: zoteroBuildWindows,
        }
        return zoteroInfo;
    }

}


export function compareOldNewNote(
    existingNote: string,
    newNote: string,
    authorKey: string,
    settings: ZoteroAnnotationsPluginSettings
) {
    //Find the position of the line breaks in the old note
    const newLineRegex = RegExp(/\n/gm);
    const positionNewLine: number[] = [];
    let match = undefined;
    while ((match = newLineRegex.exec(existingNote))) {
        positionNewLine.push(match.index);
    }

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
    for (
        let indexLines = 0;
        indexLines < newNoteArray.length;
        indexLines++
    ) {
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
        const authorKey_Zotero = new RegExp(
            "\\(" + authorKey + ", \\d+, p. \\d+\\)$"
        );
        const authorKey_Zotfile = new RegExp(
            "\\(" + authorKey + " \\d+:\\d+\\)$"
        );
        selectedNewLine = selectedNewLine.replace(authorKey_Zotero, "");
        selectedNewLine = selectedNewLine.replace(authorKey_Zotfile, "");

        //Remove formatting added by bibnotes at the end of the line
        selectedNewLine = selectedNewLine.replace(/=$/gm, "");
        selectedNewLine = selectedNewLine.replace(/\**$/gm, "");
        selectedNewLine = selectedNewLine.replace(/\*$/gm, "");
        selectedNewLine = selectedNewLine.replace(/"$/gm, "");

        //Calculate the length of the highlighted text
        if (selectedNewLine == undefined) {
            continue;
        }

        const lengthExistingLine = selectedNewLine.length;
        //Calculate the length of the comment text
        if (lengthExistingLine === 0) {
            continue;
        }

        //CHECK THE PRESENCE OF THE HIGHLIGHTED TEXT IN THE EXISTING ONE

        //Check if the entire line (or part of the line for longer lines)
        // are found in the existing note
        if (lengthExistingLine > 1 && lengthExistingLine < 30) {
            segmentWhole = selectedNewLine;
            positionArray.push(existingNote.indexOf(segmentWhole));
        } else if (lengthExistingLine >= 30 && lengthExistingLine < 150) {
            segmentFirstHalf = selectedNewLine.substring(
                0,
                lengthExistingLine / 2
            );
            positionArray.push(existingNote.indexOf(segmentFirstHalf));

            segmentSecondHalf = selectedNewLine.substring(
                lengthExistingLine / 2 + 1,
                lengthExistingLine
            );
            positionArray.push(existingNote.indexOf(segmentSecondHalf));
        } else if (lengthExistingLine >= 150) {
            segmentFirstQuarter = selectedNewLine.substring(
                0,
                lengthExistingLine / 4
            );
            positionArray.push(existingNote.indexOf(segmentFirstQuarter));

            segmentSecondQuarter = selectedNewLine.substring(
                lengthExistingLine / 4 + 1,
                lengthExistingLine / 2
            );
            positionArray.push(existingNote.indexOf(segmentSecondQuarter));

            segmentThirdQuarter = selectedNewLine.substring(
                lengthExistingLine / 2 + 1,
                (3 * lengthExistingLine) / 4
            );
            positionArray.push(existingNote.indexOf(segmentThirdQuarter));

            segmentFourthQuarter = selectedNewLine.substring(
                (3 * lengthExistingLine) / 4 + 1,
                lengthExistingLine
            );
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
    if (settings.isDoubleSpaced) {
        doubleSpaceAdd = "\n";
    }

    //Add the new annotations into the old note
    for (
        let indexNoteElements = newNoteInsertText.length - 1;
        indexNoteElements >= 0;
        indexNoteElements--
    ) {
        const insertText = newNoteInsertText[indexNoteElements];
        const insertPosition = newNoteInsertPosition[indexNoteElements];
        existingNote =
            existingNote.slice(0, insertPosition) +
            doubleSpaceAdd +
            "\n" +
            insertText +
            existingNote.slice(insertPosition);
    }
    if (settings.saveManualEdits == "Save Entire Note") {
        return existingNote;
    }
    if (settings.saveManualEdits == "Select Section") {
        //identify the keyword marking the beginning and the end of the section not to be overwritten
        const startSave = settings.saveManualEditsStart;
        const endSave = settings.saveManualEditsEnd;

        //identify the keyword identifying the beginning of the section to be preserved is empty, 
        // the position is the beginning of the string. Otherwise find the match in the text
        let startSaveOld = 0;
        if (startSave !== "") {
            startSaveOld = existingNote.indexOf(startSave);
        }
        if (startSaveOld < 0) {
            startSaveOld = 0;
        }

        //identify the keyword identifying the end of the section to be preserved. 
        // If is empty, the position is the end of the string. Otherwise find the match in the text
        let endSaveOld: number = existingNote.length;
        if (endSave !== "") {
            endSaveOld = existingNote.indexOf(endSave) + endSave.length;
        }
        if (endSaveOld < 0) {
            endSaveOld = existingNote.length;
        }

        //Find the sections of the existing note to be preserved
        const existingNotePreserved = existingNote.substring(
            startSaveOld,
            endSaveOld
        );

        //identify the keyword identifying the beginning of the section to be preserved is empty, 
        // the position is the beginning of the string. Otherwise find the match in the text
        let startSaveNew = 0;
        if (startSave !== "") {
            startSaveNew = newNote.indexOf(startSave);
        }
        if (startSaveNew < 0) {
            startSaveNew = 0;
        }

        //identify the keyword identifying the ebd of the section to be preserved is empty, 
        // the position is the end of the string. Otherwise find the match in the text
        let endSaveNew: number = newNote.length;
        if (endSave !== "") {
            endSaveNew = newNote.indexOf(endSave) + endSave.length;
        }
        if (endSaveNew < 0) {
            endSaveNew = newNote.length;
        }

        //Find the sections of the existing note before the one to be preserved
        const newNotePreservedBefore = newNote.substring(0, startSaveNew);
        //Find the sections of the existing note after the one to be preserved
        const newNotePreservedAfter = newNote.substring(
            endSaveNew,
            newNote.length
        );

        const newNoteCombined =
            newNotePreservedBefore +
            existingNotePreserved +
            newNotePreservedAfter;

        return newNoteCombined;
    }
}


export async function createNote(selectedEntry: Reference, settings: ZoteroAnnotationsPluginSettings): Promise<void> {
    // Extract the reference within bracket to faciliate comparison
    const authorKey = createAuthorKey(selectedEntry.creators);
    // set the authorkey field (with or without first name) on the 
    // entry to use when creating the title and to replace in the template
    selectedEntry.authorKey = authorKey;
    selectedEntry.authorKeyInitials = createAuthorKeyInitials(
        selectedEntry.creators
    );
    selectedEntry.authorKeyFullName = createAuthorKeyFullName(
        selectedEntry.creators
    );

    // Load Template
    const templateNote = await importTemplate(settings);

    // Create the metadata
    let litnote: string = parseMetadata(selectedEntry, settings, templateNote);

    // Define the name and full path of the file to be exported
    const noteTitle = createNoteTitle(selectedEntry, settings.importFileName,);
    const notePath = createNotePath(noteTitle, settings.importPath)
    // Extract the annotation and the keyword from the text
    const resultAnnotations = extractAnnotation(selectedEntry, notePath, settings);

    // Replace annotations in the template
    litnote = litnote.replace(
        "{{PDFNotes}}",
        resultAnnotations.extractedAnnotations
    );
    litnote = litnote.replace(
        "{{UserNotes}}",
        resultAnnotations.extractedUserNote
    );
    litnote = litnote.replace(
        "{{Images}}",
        resultAnnotations.extractedImages
    );

    let extractedKeywords = resultAnnotations.extractedKeywords;
    if (extractedKeywords == undefined) {
        extractedKeywords = [];
    }

    // Join the tags in the metadata with the tags extracted in the text and replace them in the text
    litnote = replaceTagList(
        selectedEntry,
        extractedKeywords,
        litnote,
        settings.multipleFieldsDivider
    );

    // delete the missing fields in the metadata
    const missingFieldSetting = settings.missingfield;
    litnote = replaceMissingFields(
        litnote,
        missingFieldSetting,
        settings.missingfieldreplacement
    );
    // Compare old note and new note
    // Check the option in settings.saveManualEdits.
    if (
        settings.saveManualEdits !== "Overwrite Entire Note" &&
        fs.existsSync(notePath)
    ) {
        // In that case compare existing file with new notes. If false don't look at existing note
        // Check if an old version exists. If the old version has annotations then add the new annotation to the old annotaiton

        const existingNoteAll = String(fs.readFileSync(notePath));

        litnote = compareOldNewNote(
            existingNoteAll,
            litnote,
            authorKey,
            settings
        );
    }
    fs.writeFile(notePath, litnote, err => {
        if (err) {
            console.error(err);
            return;
        }
        new Notice(`Imported ${selectedEntry.citationKey}`);
    });
}


export function updateNotes(settings: ZoteroAnnotationsPluginSettings) {
    console.log("Updating Zotero library");
    // Check if the json file exists
    const jsonPath = resolvePath(settings.bibPath)
    if (!fs.existsSync(jsonPath)) {
        new Notice("No BetterBibTex Json file found at " + jsonPath);
    }
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
                if (firstElement > secondElement) {
                    return -1;
                }
                if (firstElement < secondElement) {
                    return 1;
                }
                return 0;
            });
        }

        const datemodified = new Date(noteDateModifiedArray[0]);
        // skip if it was modified before the last update
        if (datemodified < lastUpdate) continue;
        // skip if the setting is to update only existing note and the note is not found at the give folder
        const noteTitle = createNoteTitle(selectedEntry, settings.importFileName)
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

export function openNoteAfterImport(file: TFile, isOpen: boolean) {
    if (isOpen) {
        this.app.workspace.getLeaf(false).openFile(file);
    }
}
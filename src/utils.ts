import { FileSystemAdapter, TFile, normalizePath } from "obsidian";
import path from "path";
import {
    ZoteroAnnotationsPluginSettings,
    Reference,
} from "./types";

import { TEMPLATE_BRACKET_REG, TEMPLATE_REG, templatePlain } from "./constants";

// Get normalized path
export const resolvePath = function (rawPath: string): string {
    const vaultRoot = this.app.vault.adapter instanceof FileSystemAdapter
        ? this.app.vault.adapter.getBasePath() : '/';
    return path.normalize(path.resolve(vaultRoot, rawPath))
}

// convert camelCase -> Camel Case
export function camelToNormalCase(str: string) {
    return (
        str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
                return str.toUpperCase();
            })
    );
}

// Given a string get the first letter of each word with a . after it
export const getInitials = (string: string) => {
    let words = string.split(" "), initials = words[0].substring(0, 1).toUpperCase() + ".";
    if (words.length > 1) {
        initials += words[words.length - 1].substring(0, 1).toUpperCase() + ".";
    }
    return initials;
};

// Cleanup a string (remove URL, remove special characters) and put elipsis if too long
export function truncate(str: string, n: number) {
    var str = str.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/[^\x00-\x7F]/g, "");
    return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
};


// import template from file if present or set it to the default template
export async function importTemplate(
    settings: ZoteroAnnotationsPluginSettings
): Promise<string> {
    const template = this.app.metadataCache.getFirstLinkpathDest(normalizePath(settings.templatePath), "");
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
        copy = replaceTemplate(copy, KW_Brackets, `${selectedEntry[KW as keyof Reference]}`);
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

export function removeQuoteFromStart(
    quote: string,
    annotation: string
) {
    let copy = annotation.slice();
    while (copy.charAt(0) === quote) copy = copy.substring(1);
    return copy;
}
export function removeQuoteFromEnd(
    quote: string,
    annotation: string
) {
    let copy = annotation.slice();
    while (copy[copy.length - 1] === quote) copy = copy.substring(0, copy.length - 1);
    return copy;
}

export function orderByDateModified(a: Reference, b: Reference) {
    if (a.dateModified > b.dateModified) return -1
    if (a.dateModified < b.dateModified) return 1
    return 0;
}

export function insertTagList(
    tagList: string[],
    note: string
) {
    if (tagList.length == 0) {
        return note;
    } else {
        const tagListBraket = tagList.map(makeWiki);
        note = replaceTemplate(note, `[[{{keywords}}]]`, String(tagListBraket.join("; ")));
        note = replaceTemplate(note, `{{keywords}}`, String(tagList.join("; ")));
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
            .trim().replace(TEMPLATE_REG, missingfieldreplacement).trim();
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
    copy = copy.replace("## Abstract\n" + "\n" + "## Files and Links\n", "## Files and Links\n");
    copy = copy.replace("## Files and Links\n" + "\n" + "## Zotero Tags\n", "## Zotero Tags\n");
    copy = copy.replace("## Zotero Tags\n" + "\n", "\n");

    return copy;
}

export function getLocalFileLink(reference: Reference) {
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
            "[" + reference.attachments[attachmentindex].title + "](file:///" +
            encodeURI(reference.attachments[attachmentindex].path.replaceAll(" ", " ")) + ")"; 

        filesList.push(selectedfile);
    }
    //turn the array into a string
    const filesListString = filesList.join("; ");
    return filesListString;
}

export function getNoteTitle(
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

export function createNotePath(
    noteTitle: string,
    exportPath: string
) {
    return resolvePath(`${exportPath}/${noteTitle}.md`)
}

export function insertKeywordList(
    selectedEntry: Reference,
    arrayExtractedKeywords: string[],
    metadata: string,
    divider: string
) {
    // Copy the keywords extracted by Zotero and store them in an array
    selectedEntry.zoteroTags = [];
    if (selectedEntry.tags.length > 0) {
        for (let indexTag = 0; indexTag < selectedEntry.tags.length; indexTag++) {
            selectedEntry.zoteroTags.push(selectedEntry.tags[indexTag].tag);
        }
    }

    //add a space after the divided if it is not present
    if (divider.slice(-1) !== " ") divider = divider + " ";

    //Create three arrays for the tags from the metadata, 
    // tags exported from the text and tags combined
    const tagsZotero = selectedEntry.zoteroTags.sort();
    const tagsPDF = arrayExtractedKeywords.sort();
    const tagsCombined = tagsZotero.concat(tagsPDF).sort();

    //metadata = createTagList(selectedEntry.zoteroTags, metadata)

    //Replace in the text the tags extracted by Zotero
    if (tagsZotero.length > 0) {
        const tagsZoteroBracket = tagsZotero.map(makeWiki);
        metadata = replaceTemplate(metadata, `[[{{keywordsZotero}}]]`, String(tagsZoteroBracket.join(divider)));
        const tagsZoteroQuotes = tagsZotero.map(makeQuotes);
        metadata = replaceTemplate(metadata, `"{{keywordsZotero}}"`, String(tagsZoteroQuotes.join(divider)));
        const tagsZoteroTags = tagsZotero.map(makeTags);
        metadata = replaceTemplate(metadata, `#{{keywordsZotero}}`, String(tagsZoteroTags.join(divider)));
        metadata = replaceTemplate(metadata, `{{keywordsZotero}}`, String(tagsZotero.join(divider)));
    }

    //Replace in the text the tags extracted from the PDF
    if (tagsPDF.length > 0) {
        const tagsPDFBracket = tagsPDF.map(makeWiki);
        metadata = replaceTemplate(metadata, `[[{{keywordsPDF}}]]`, String(tagsPDFBracket.join(divider)));
        const tagsPDFQuotes = tagsPDF.map(makeQuotes);
        metadata = replaceTemplate(metadata, `"{{keywordsPDF}}"`, String(tagsPDFQuotes.join(divider)));
        const tagsPDFTags = tagsPDF.map(makeTags);
        metadata = replaceTemplate(metadata, `#{{keywordsPDF}}`, String(tagsPDFTags.join(divider)));
        metadata = replaceTemplate(metadata, `{{keywordsPDF}}`, String(tagsPDF.join(divider)));
    }

    //Replace in the text the tags extracted from the PDF 
    // combined with those extracted from the metadata
    if (tagsCombined.length > 0) {
        const tagsCombinedBracket = tagsCombined.map(makeWiki);
        metadata = replaceTemplate(metadata, `[[{{keywords}}]]`, String(tagsCombinedBracket.join(divider)));
        metadata = replaceTemplate(metadata, `[[{{keywordsAll}}]]`, String(tagsCombinedBracket.join(divider)));
        const tagsCombinedQuotes = tagsCombined.map(makeQuotes);
        metadata = replaceTemplate(metadata, `"{{keywordsAll}}"`, String(tagsCombinedQuotes.join(divider)));
        metadata = replaceTemplate(metadata, `"{{keywords}}"`, String(tagsCombinedQuotes.join(divider)));
        const tagsCombinedTags = tagsCombined.map(makeTags);
        metadata = replaceTemplate(metadata, `#{{keywordsAll}}`, String(tagsCombinedTags.join(divider)));
        metadata = replaceTemplate(metadata, `#{{keywords}}`, String(tagsCombinedTags.join(divider)));
        metadata = replaceTemplate(metadata, `{{keywordsAll}}`, String(tagsCombined.join(divider)));
        metadata = replaceTemplate(metadata, `{{keywords}}`, String(tagsCombined.join(divider)));
    }

    if (selectedEntry.zoteroTags.length == 0) {
        metadata = metadata.replace("# Tags\n", "");
        metadata = metadata.replace("## Tags\n", "");
        metadata = metadata.replace("### Tags\n", "");
    }
    return metadata;
}

export function getZoteroAppInfo(
    selectedEntry: Reference,
    settings: ZoteroAnnotationsPluginSettings
) {
    //Check the path to the data folder
    if (selectedEntry.attachments[0] !== undefined) {
        //identify the folder on the local computer where zotero/storage is found
        //first look into the same path as the pdf attachment
        let pathZoteroStorage = "";
        let zoteroBuildWindows: boolean = undefined;

        //check if the base path where the attachment is stored is in Zotero/storage
        const zoteroStorageMac = new RegExp(/.+?(?=Zotero\/storage)Zotero\/storage\//gm);

        if (zoteroStorageMac.test(selectedEntry.attachments[0].path)) {
            pathZoteroStorage = String(selectedEntry.attachments[0].path.match(zoteroStorageMac));
            zoteroBuildWindows = false;
        }

        const zoteroStorageWindows = new RegExp(/.+?(?=Zotero\\storage\\)Zotero\\storage\\/gm);

        if (zoteroStorageWindows.test(selectedEntry.attachments[0].path)) {
            pathZoteroStorage = String(selectedEntry.attachments[0].path.match(zoteroStorageWindows));
            zoteroBuildWindows = true;
        }

        if (pathZoteroStorage.length == 0 && settings.zoteroStoragePathManual.length > 0) {
            pathZoteroStorage = settings.zoteroStoragePathManual;
            if (pathZoteroStorage.toLowerCase().endsWith("\\zotero")) pathZoteroStorage = pathZoteroStorage + "\\storage\\"
            if (pathZoteroStorage.toLowerCase().endsWith("\\zotero\\")) pathZoteroStorage = pathZoteroStorage + "storage\\"
            if (pathZoteroStorage.toLowerCase().endsWith("/zotero")) pathZoteroStorage = pathZoteroStorage + "/storage/"
            if (pathZoteroStorage.toLowerCase().endsWith("/zotero/")) pathZoteroStorage = pathZoteroStorage + "storage/"
        }
        const zoteroInfo = {
            pathZoteroStorage: pathZoteroStorage,
            zoteroBuildWindows: zoteroBuildWindows,
        }
        return zoteroInfo;
    }

}

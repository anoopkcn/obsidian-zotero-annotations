import { AnnotationElements, MyPluginSettings, Reference } from "./types";
import { camelToNormalCase, createAuthorKey, createAuthorKeyFullName, createAuthorKeyInitials, createCreatorAllList, createCreatorList, createLocalFileLink, removeQuoteFromEnd, removeQuoteFromStart, replaceAllTemplates, replaceTemplate, zoteroAppInfo } from "./utils";
import { formatNoteElements } from "./format";

export function getAnnotationType(
    annotationCommentFirstWord: string,
    annotationCommentAll: string,
    settings: MyPluginSettings
) {
    const {
        keyMergeAbove,
        keyCommentPrepend,
        keyH1,
        keyH2,
        keyH3,
        keyH4,
        keyH5,
        keyH6,
        keyKeyword,
        keyTask,
    } = settings;

    //Take the lower cap version
    annotationCommentFirstWord = annotationCommentFirstWord.toLowerCase();

    let annotationType = "noKey";
    if (
        annotationCommentFirstWord === keyMergeAbove.toLowerCase() ||
        annotationCommentAll === keyMergeAbove
    ) {
        annotationType = "typeMergeAbove";
    } else if (
        annotationCommentFirstWord === keyCommentPrepend.toLowerCase()
    ) {
        annotationType = "typeCommentPrepend";
    } else if (annotationCommentFirstWord === keyH1.toLowerCase()) {
        annotationType = "typeH1";
    } else if (annotationCommentFirstWord === keyH2.toLowerCase()) {
        annotationType = "typeH2";
    } else if (annotationCommentFirstWord === keyH3.toLowerCase()) {
        annotationType = "typeH3";
    } else if (annotationCommentFirstWord === keyH4.toLowerCase()) {
        annotationType = "typeH4";
    } else if (annotationCommentFirstWord === keyH5.toLowerCase()) {
        annotationType = "typeH5";
    } else if (annotationCommentFirstWord === keyH6.toLowerCase()) {
        annotationType = "typeH6";
    }

    if (annotationCommentAll === keyH1.toLowerCase()) {
        annotationType = "typeH1";
    } else if (annotationCommentAll === keyH2.toLowerCase()) {
        annotationType = "typeH2";
    } else if (annotationCommentAll === keyH3.toLowerCase()) {
        annotationType = "typeH3";
    } else if (annotationCommentAll === keyH4.toLowerCase()) {
        annotationType = "typeH4";
    } else if (annotationCommentAll === keyH5.toLowerCase()) {
        annotationType = "typeH5";
    } else if (annotationCommentAll === keyH6.toLowerCase()) {
        annotationType = "typeH6";
    } else if (
        annotationCommentAll === keyKeyword.toLowerCase() ||
        annotationCommentFirstWord === keyKeyword.toLowerCase()
    ) {
        annotationType = "typeKeyword";
    } else if (
        annotationCommentAll === keyTask.toLowerCase() ||
        annotationCommentFirstWord === keyTask.toLowerCase()
    ) {
        annotationType = "typeTask";
    }
    return annotationType;
}


export function extractAnnotation(selectedEntry: Reference, noteTitleFull: string, settings: MyPluginSettings) {
    let extractedAnnotations = "";
    let extractedImages = "";
    let extractedUserNote = "";
    let keywordArray: string[] = [];

    const zoteroInfo = zoteroAppInfo(selectedEntry, settings)

    //run the function to parse the annotation for each note (there could be more than one)
    let noteElements: AnnotationElements[] = [];
    let userNoteElements: AnnotationElements[] = [];
    if (selectedEntry.notes.length > 0) {
        let indexNote = selectedEntry.notes.length - 1;
        // for (
        //     let indexNote = 0;
        //     indexNote < selectedEntry.notes.length;
        //     indexNote++
        // ) {
        let note = selectedEntry.notes[indexNote].note;

        // Remove special characters that would break the replacement of the text in the template
        //lineElements.rowEdited = lineElements.rowEdited.replaceAll("$>", '$$');
        note = note.replaceAll("$&", "$ &");

        //Identify the extraction Type (Zotero vs. Zotfile)
        let extractionType = undefined;

        if (unescape(note).includes("<span class=")) {
            extractionType = "Zotero";
        } else if (
            unescape(note).includes('<a href="zotero://open-pdf/library/')
        ) {
            extractionType = "Zotfile";
        }
        //Identify manual notes (not extracted from PDF) extracted from zotero
        else if (unescape(note).includes("div data-schema-version")) {
            extractionType = "UserNote";
        } else {
            extractionType = "Other";
        }
        let noteElementsSingle: AnnotationElements[] = []; // array of elements
        if (extractionType === "Zotero") {
            noteElementsSingle =
                parseAnnotationLinesintoElementsZotero(note, settings);
            noteElements = noteElements.concat(noteElementsSingle); //concatenate the annotation element to the next one
        }

        if (extractionType === "Zotfile") {
            noteElementsSingle =
                parseAnnotationLinesintoElementsZotfile(note, settings);

            noteElements = noteElements.concat(noteElementsSingle); //concatenate the annotation element to the next one
        }

        if (extractionType === "UserNote" || extractionType === "Other") {
            noteElementsSingle =
                parseAnnotationLinesintoElementsUserNote(note);
            userNoteElements = userNoteElements.concat(noteElementsSingle); //concatenate the annotation element to the next one
        }
        // noteElements = noteElements;
        // userNoteElements = userNoteElements;
        // }

        //Run the function to edit each line
        const resultsLineElements = formatNoteElements(
            noteElements,
            selectedEntry.citationKey,
            settings,
            zoteroInfo
        );

        keywordArray = resultsLineElements.keywordArray;

        //Create the annotation by merging the individial elements of rowEditedArray. Do the same for the colour
        extractedAnnotations =
            resultsLineElements.rowEditedArray.join("\n");
        extractedImages = resultsLineElements.imagesArray.join("\n");
        //Creates an array with the notes from the user
        const extractedUserNoteArray = Array.from(
            Object.values(userNoteElements),
            (note) => note.rowEdited
        );
        extractedUserNote = extractedUserNoteArray.join("\n");
    }

    //Export both the extracted annotations, user annotation, and the keywords extracted in the object extractedNote
    const extractedNote = {
        extractedAnnotations: extractedAnnotations,
        extractedUserNote: extractedUserNote,
        extractedKeywords: keywordArray,
        extractedImages: extractedImages,
        noteElements: noteElements,
    };
    return extractedNote;
}



export function parseMetadata(selectedEntry: Reference, settings: MyPluginSettings, templateOriginal: string) {
    // Create Note from Template
    const template = templateOriginal;

    //Create Note
    let note = template;

    //Replace the author/s

    note = createCreatorList(
        selectedEntry.creators,
        "author",
        note,
        settings.multipleFieldsDivider,
        settings.nameFormat
    );
    //Replace the editor/s
    note = createCreatorList(
        selectedEntry.creators,
        "editor",
        note,
        settings.multipleFieldsDivider,
        settings.nameFormat
    );

    //Replace the creators (authors+editors+everybodyelse)
    note = createCreatorAllList(
        selectedEntry.creators,
        note,
        settings.multipleFieldsDivider,
        settings.nameFormat
    );

    //Create field year
    if (selectedEntry.hasOwnProperty("date")) {
        selectedEntry.year = selectedEntry.date.match(/\d\d\d\d/gm) + "";
    }

    //Create field ZoteroLocalLibrary
    if (selectedEntry.hasOwnProperty("select")) {
        selectedEntry.localLibrary =
            "[Zotero](" + selectedEntry.select + ")";
        selectedEntry.localLibraryLink = selectedEntry.select;
    }

    //Fix itemType
    selectedEntry.itemType = camelToNormalCase(selectedEntry.itemType);

    // Create in-line citation (e.g. Collier, Laporte and Seawright (2009))
    selectedEntry.citationInLine =
        createAuthorKey(selectedEntry.creators) +
        " " +
        "(" +
        selectedEntry.year +
        ")";
    selectedEntry.citationInLine = selectedEntry.citationInLine.replace(
        "()",
        ""
    );

    // Create in-line citation with initials (e.g. Collier, D., Laporte, J. and Seawright, J. (2009))
    selectedEntry.citationInLineInitials =
        createAuthorKeyInitials(selectedEntry.creators) +
        " " +
        "(" +
        selectedEntry.year +
        ")";
    selectedEntry.citationInLineInitials =
        selectedEntry.citationInLineInitials.replace("()", "");

    // Create in-line citation with initials (e.g. Collier, D., Laporte, J. and Seawright, J. (2009))
    selectedEntry.citationInLineFullName =
        createAuthorKeyFullName(selectedEntry.creators) +
        " " +
        "(" +
        selectedEntry.year +
        ")";
    selectedEntry.citationInLineFullName =
        selectedEntry.citationInLineFullName.replace("()", "");

    // Replace short and full citation
    if (selectedEntry.itemType == "Journal Article") {
        selectedEntry.citationShort =
            selectedEntry.citationInLine +
            " " +
            "'" +
            selectedEntry.title +
            "'";
        selectedEntry.citationFull =
            selectedEntry.citationShort +
            ", " +
            "*" +
            selectedEntry.publicationTitle +
            "*" +
            ", " +
            selectedEntry.volume +
            "(" +
            selectedEntry.issue +
            "), " +
            "pp. " +
            selectedEntry.pages +
            ".";

        selectedEntry.citationFull = selectedEntry.citationFull.replace(
            "() ",
            ""
        );
        selectedEntry.citationShort = selectedEntry.citationShort.replace(
            "** ",
            ""
        );
        selectedEntry.citationFull = selectedEntry.citationFull.replace(
            "** ",
            ""
        );
        selectedEntry.citationFull = selectedEntry.citationFull.replace(
            "pp. ",
            ""
        );
    }

    //create field file
    //if (selectedEntry.hasOwnProperty("attachment.")){
    selectedEntry.file = createLocalFileLink(selectedEntry);
    // Create an array with all the fields
    const entriesArray = Object.keys(selectedEntry);

    //replace the single-value placeholders with the value of the field
    note = replaceAllTemplates(entriesArray, note, selectedEntry);

    //remove single backticks but retain triple backticks
    note = note.replace(/```/g, "HEREISAPLACEHOLDERFORBACKTICK");
    note = note.replace(/`/g, "'");
    note = note.replace(/HEREISAPLACEHOLDERFORBACKTICK/g, "```");

    // //if the abstract is missing, delete Abstract headings
    // Return the metadata
    return note;
}



// FUNCTION TO PARSE ANNOTATION
export function parseAnnotationLinesintoElementsZotfile(note: string, settings: MyPluginSettings) {
    //Split the note into lines
    const lines = note.split(/<p>/gm);
    const noteElements: AnnotationElements[] = [];
    for (let indexLines = 0; indexLines < lines.length; indexLines++) {
        //Remote html tags
        const selectedLineOriginal = lines[indexLines];

        const selectedLine = selectedLineOriginal.replace(
            /<\/?[^>]+(>|$)/g,
            ""
        );

        //Skip if empty
        if (selectedLine === "") {
            continue;
        }

        //Crety empty lineElements
        //@ts-ignore
        const lineElements: AnnotationElements = {
            highlightText: "",
            highlightColour: "",
            annotationType: "",
            citeKey: "",
            commentText: "",
            rowOriginal: selectedLine,
            rowEdited: selectedLine,
            indexNote: undefined,
            foundOld: undefined,
            positionOld: undefined,
            extractionSource: "zotfile",
            colourTextAfter: "",
            colourTextBefore: "",
            // added missing properties
            imagePath: "",
            pagePDF: 0,
            pageLabel: 0,
            attachmentURI: "",
            zoteroBackLink: "",
            annotationKey: "",
        };

        //Extract the citeKey
        lineElements.citeKey = String(selectedLine.match(/\(([^)]+)\)+$/g));
        if (lineElements.citeKey == `null`) {
            lineElements.citeKey = String(
                selectedLine.match(/\(([^D+]+) \d+\S+\)/g)
            );
        }

        const posCiteKeyBegins = selectedLine.indexOf(lineElements.citeKey);

        let extractedText = "";
        if (posCiteKeyBegins !== -1) {
            extractedText = selectedLine
                .substring(0, posCiteKeyBegins - 1)
                .trim();

            // Remove quotation marks from extractedText
            ["“", '"', "`", "'"].forEach(
                (quote) =>
                (extractedText = removeQuoteFromStart(
                    quote,
                    extractedText
                ))
            );
            ["”", '"', "`", "'"].forEach(
                (quote) =>
                (extractedText = removeQuoteFromEnd(
                    quote,
                    extractedText
                ))
            );
        }

        //Extracte the Zotero backlink
        lineElements.zoteroBackLink = "";
        if (
            /zotero:\/\/open-pdf\/library\/items\/\S+page=\d+/g.test(
                selectedLineOriginal
            )
        ) {
            const zoteroBackLink = String(
                selectedLineOriginal.match(
                    /zotero:\/\/open-pdf\/library\/items\/\S+page=\d+/g
                )
            );
            lineElements.zoteroBackLink = zoteroBackLink;
        }

        //Extract the page of the annotation in the publication
        if (/(\d+)(?!.*\d)/g.test(selectedLineOriginal)) {
            const pageLabel = String(
                selectedLineOriginal.match(/(\d+)(?!.*\d)/g)
            );
            if (pageLabel == null) {
                lineElements.pageLabel = null;
            } else {
                lineElements.pageLabel = Number(pageLabel);
            }
        }

        //Identify if the text is highlight or comment. if it is a comment extract the type of comment

        const annotationCommentAll = "";
        if (lineElements.citeKey.includes("(note on page:")) {
            lineElements.commentText = extractedText;
            lineElements.citeKey = "";
        } else {
            lineElements.highlightText = extractedText;
        }

        // 	Extract the first word in the comment added to the annotation
        let firstBlank = -1;
        let annotationCommentFirstWord = "";
        if (lineElements.commentText.length > 0) {
            firstBlank = lineElements.commentText.indexOf(" ");
            if (firstBlank === -1) {
                firstBlank = lineElements.commentText.length;
            }
            annotationCommentFirstWord = lineElements.commentText.substring(
                0,
                firstBlank
            );
        }

        lineElements.annotationType = getAnnotationType(
            annotationCommentFirstWord,
            lineElements.commentText,
            settings
        );
        if (firstBlank == -1) {
            firstBlank = annotationCommentAll.length;
        }
        lineElements.commentText =
            lineElements.annotationType === "noKey"
                ? lineElements.commentText
                : lineElements.commentText
                    .substring(
                        firstBlank,
                        lineElements.commentText.length
                    )
                    .trim();

        //If a comment includes the key for a transformation, apply that to the previous element

        if (noteElements.length > 1) {
            if (
                lineElements.annotationType != "noKey" &&
                noteElements[noteElements.length - 1].annotationType ===
                "noKey" &&
                noteElements[noteElements.length - 1].commentText === ""
            ) {
                noteElements[noteElements.length - 1].annotationType =
                    lineElements.annotationType;
                noteElements[noteElements.length - 1].commentText =
                    lineElements.commentText;

                continue;
            }
        }
        noteElements.push(lineElements);
    }
    return noteElements;
}


export function parseAnnotationLinesintoElementsUserNote(note: string) {
    note = note
        // Replace backticks
        .replace(/`/g, "'")
        // Correct when zotero exports wrong key (e.g. Author, date, p. p. pagenum)
        .replace(/, p. p. /g, ", p. ")
        .trim();
    // Split the annotations into an array where each row is an entry
    const lines = note.split(/<\/h1>|\n\n|<\/p>/gm);
    const noteElements: AnnotationElements[] = [];

    //Loop through the lines
    const lengthLines = Object.keys(lines).length;
    for (let indexLines = 0; indexLines < lengthLines; indexLines++) {
        const selectedLineOriginal = unescape(lines[indexLines]);

        // Replace backticks with single quote
        let selectedLine = replaceTemplate(selectedLineOriginal, "`", "'");

        // Correct encoding issues with special character showing incorrectly
        selectedLine = replaceTemplate(selectedLine, "&amp;", "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");

        const lineElements: AnnotationElements = {
            highlightText: "",
            highlightColour: "",
            annotationType: "",
            citeKey: "",
            commentText: "",
            rowOriginal: selectedLine,
            rowEdited: selectedLine,
            indexNote: undefined,
            foundOld: undefined,
            positionOld: undefined,
            extractionSource: "UserNote",
            colourTextBefore: "",
            colourTextAfter: "",
            imagePath: "",
            pagePDF: 0,
            pageLabel: 0,
            attachmentURI: "",
            zoteroBackLink: "",
            annotationKey: "",
            commentFormatted: "",
            commentFormattedNoPrepend: "",
            highlightFormatted: "",
            highlightFormattedNoPrepend: "",
            inlineTagsText: "",
            inlineTagsArray: [],
            inlineTagsFormatted: "",
            inlineTagsFormattedNoPrepend: "",
            colourTemplate: "",
            colourTemplateFormatted: "",
            colourTemplateNoPrepend: "",
        };

        lineElements.rowEdited = selectedLine;

        //Add the element to the array containing all the elements

        noteElements.push(lineElements);
    }

    return noteElements;
}

export function parseAnnotationLinesintoElementsZotero(note: string, settings: MyPluginSettings) {
    // clean the entire annotation
    note = note
        // .replace(
        // 	Remove HTML tags
        // 	HTML_TAG_REG,
        // 	"")
        // 	Replace backticks
        .replace(/`/g, "'")
        // Correct when zotero exports wrong key (e.g. Author, date, p. p. pagenum)
        .replace(/, p. p. /g, ", p. ")
        .trim();
    // Split the annotations into an array where each row is an entry
    const lines = note.split(/<\/h1>|<\/p>|<h1>/gm);
    const noteElements: AnnotationElements[] = [];

    //Loop through the lines
    const lengthLines = Object.keys(lines).length;
    for (let indexLines = 1; indexLines < lengthLines; indexLines++) {
        const selectedLineOriginal = unescape(lines[indexLines]);

        //Remove HTML tags
        let selectedLine = String(
            selectedLineOriginal.replace(/<\/?[^>]+(>|$)/g, "")
        );
        // 	// Replace backticks with single quote
        selectedLine = replaceTemplate(selectedLine, "`", "'");
        //selectedLine = replaceTemplate(selectedLine, "/<i/>", "");
        // 	// Correct encoding issues
        selectedLine = replaceTemplate(selectedLine, "&amp;", "&");

        //@ts-ignore
        const lineElements: AnnotationElements = {
            highlightText: "",
            highlightColour: "",
            annotationType: "",
            citeKey: "",
            commentText: "",
            inlineTagsText: "",
            inlineTagsArray: [],
            rowOriginal: selectedLine,
            rowEdited: selectedLine,
            indexNote: undefined,
            foundOld: undefined,
            positionOld: undefined,
            extractionSource: "zotero",
            colourTextBefore: "",
            colourTextAfter: "",
            imagePath: "",
            pagePDF: 0,
            pageLabel: 0,
            zoteroBackLink: "",
            attachmentURI: "",
            annotationKey: "",
        };

        //Record the extraction method
        lineElements.extractionSource = "zotero";

        //Identify images
        if (/data-attachment-key=/gm.test(selectedLineOriginal)) {
            lineElements.annotationType = "typeImage";
            lineElements.imagePath = String(
                selectedLineOriginal.match(/key="([^"]*)"/g)[0]
            )
                .replaceAll('"', "")
                .replace("key=", "");
        }

        //Extract the colour of the highlight
        if (/"color":"#......"/gm.test(selectedLineOriginal)) {
            let highlightColour = String(
                selectedLineOriginal.match(/"color":"#......"/gm)
            );
            if (highlightColour == null) {
                highlightColour = "";
            }
            highlightColour = highlightColour.replace('color":', "");
            highlightColour = highlightColour.replace('"', "");
            lineElements.highlightColour = highlightColour;
        }

        //Extracte the page of the pdf
        if (/"pageIndex":\d+/gm.test(selectedLineOriginal)) {
            let pagePDF = String(
                selectedLineOriginal.match(/"pageIndex":\d+/gm)
            );
            if (pagePDF == null) {
                lineElements.pagePDF = null;
            } else {
                pagePDF = pagePDF.replace('"pageIndex":', "");
                lineElements.pagePDF = Number(pagePDF) + 1;
            }
        }

        //Extract the page of the annotation in the publication
        if (/"pageLabel":"\d+/g.test(selectedLineOriginal)) {
            let pageLabel = String(
                selectedLineOriginal.match(/"pageLabel":"\d+/g)
            );
            if (pageLabel == null) {
                lineElements.pageLabel = null;
            } else {
                pageLabel = pageLabel.replace('"pageLabel":"', "");
                lineElements.pageLabel = Number(pageLabel);
            }
        }

        //Extract the attachment URI

        if (
            /attachmentURI":"http:\/\/zotero\.org\/users\/\d+\/items\/\w+/gm.test(
                selectedLineOriginal
            )
        ) {
            let attachmentURI = String(
                selectedLineOriginal.match(
                    /attachmentURI":"http:\/\/zotero\.org\/users\/\d+\/items\/\w+/gm
                )
            );
            if (attachmentURI === null) {
                lineElements.attachmentURI = null;
            } else {
                attachmentURI = attachmentURI.replace(
                    /attachmentURI":"http:\/\/zotero\.org\/users\/\d+\/items\//gm,
                    ""
                );
                lineElements.attachmentURI = attachmentURI;
            }
        }

        if (
            /"attachmentURI":"http:\/\/zotero.org\/users\/local\/[a-zA-Z0-9]*\/items\/[a-zA-Z0-9]*/gm.test(
                selectedLineOriginal
            )
        ) {
            let attachmentURI = String(
                selectedLineOriginal.match(
                    /"attachmentURI":"http:\/\/zotero.org\/users\/local\/[a-zA-Z0-9]*\/items\/[a-zA-Z0-9]*/gm
                )
            );
            if (attachmentURI === null) {
                lineElements.attachmentURI = null;
            } else {
                attachmentURI = attachmentURI.replace(
                    /"attachmentURI":"http:\/\/zotero.org\/users\/local\/[a-zA-Z0-9]*\/items\//gm,
                    ""
                );
                lineElements.attachmentURI = attachmentURI;
            }
        }

        if (
            /"uris":\["http:\/\/zotero\.org\/users\/\d+\/items\/\w+/gm.test(
                selectedLineOriginal
            ) &&
            lineElements.attachmentURI == ""
        ) {
            let attachmentURI = String(
                selectedLineOriginal.match(
                    /"uris":\["http:\/\/zotero\.org\/users\/\d+\/items\/\w+/g
                )
            );
            if (attachmentURI === null) {
                lineElements.attachmentURI = null;
            } else {
                attachmentURI = attachmentURI.replace(
                    /"uris":\["http:\/\/zotero\.org\/users\/\d+\/items\//g,
                    ""
                );
                lineElements.attachmentURI = attachmentURI;
            }
        }

        //Create the zotero backlink
        if (/"annotationKey":"[a-zA-Z0-9]+/gm.test(selectedLineOriginal)) {
            let annotationKey = String(
                selectedLineOriginal.match(
                    /"annotationKey":"[a-zA-Z0-9]+/gm
                )
            );
            if (annotationKey === null) {
                lineElements.annotationKey = null;
            } else {
                annotationKey = annotationKey.replace(
                    /"annotationKey":"/gm,
                    ""
                );
                lineElements.annotationKey = annotationKey;
            }
        }
        if (
            lineElements.attachmentURI !== null &&
            lineElements.pagePDF !== null &&
            lineElements.annotationKey !== null
        ) {
            lineElements.zoteroBackLink =
                "zotero://open-pdf/library/items/" +
                lineElements.attachmentURI +
                "?page=" +
                lineElements.pagePDF +
                "&annotation=" +
                lineElements.annotationKey;
        }
        //Extract the citation within bracket
        if (
            /\(<span class="citation-item">.*<\/span>\)<\/span>/gm.test(
                selectedLineOriginal
            )
        ) {
            lineElements.citeKey = String(
                selectedLineOriginal.match(
                    /\(<span class="citation-item">.*<\/span>\)<\/span>/gm
                )
            );
            lineElements.citeKey = lineElements.citeKey.replace(
                '(<span class="citation-item">',
                ""
            );
            lineElements.citeKey = lineElements.citeKey.replace(
                "</span>)</span>",
                ""
            );
            lineElements.citeKey = "(" + lineElements.citeKey + ")";
        }
        //Find the position where the CiteKey begins
        const beginningCiteKey = selectedLine.indexOf(lineElements.citeKey);

        //Find the position where the citekey ends
        const endCiteKey =
            selectedLine.indexOf(lineElements.citeKey) +
            lineElements.citeKey.length;

        //Extract the text of the annotation
        if (endCiteKey !== 0) {
            lineElements.highlightText = selectedLine
                .substring(0, beginningCiteKey - 1)
                .trim();
            lineElements.highlightText = lineElements.highlightText.replace(
                /((?<=\p{Unified_Ideograph})\s*(?=\p{Unified_Ideograph}))/gu,
                ""
            );

            // Remove quotation marks from annotationHighlight
            ["“", '"', "`", "'"].forEach(
                (quote) =>
                (lineElements.highlightText = removeQuoteFromStart(
                    quote,
                    lineElements.highlightText
                ))
            );
            ["”", '"', "`", "'"].forEach(
                (quote) =>
                (lineElements.highlightText = removeQuoteFromEnd(
                    quote,
                    lineElements.highlightText
                ))
            );
        }

        //Extract the comment made to an annotation (after the citeKey)
        if (endCiteKey > 0) {
            const annotationCommentAll = selectedLine
                .substring(endCiteKey + 1)
                .trim();

            // 	Extract the first word in the comment added to the annotation
            let firstBlank = annotationCommentAll.indexOf(" ");
            //if (firstBlank===-1){firstBlank = annotationCommentAll.length}

            const annotationCommentFirstWord =
                annotationCommentAll.substring(0, firstBlank);
            // Identify what type of annotation is based on the first word
            if (lineElements.annotationType !== "typeImage") {
                lineElements.annotationType = getAnnotationType(
                    annotationCommentFirstWord,
                    annotationCommentAll,
                    settings
                );
            }

            // Extract the comment without the initial key and store it in
            lineElements.commentText = "";
            if (firstBlank == -1) {
                firstBlank = annotationCommentAll.length;
            }
            lineElements.commentText =
                lineElements.annotationType === "noKey" ||
                    lineElements.annotationType === "typeImage"
                    ? annotationCommentAll
                    : annotationCommentAll
                        .substring(
                            firstBlank,
                            annotationCommentAll.length
                        )
                        .trim();

            //Extract the tags

            //check if the inline tags are found in the text of the comment
            if (
                lineElements.commentText.includes(
                    settings.TagBeginningConfig
                )
            ) {
                //if the tags are at the end of the comment, tehn extract the text between the beginning of the tag and the end of the comment
                if (settings.TagEndConfig.length == 0) {
                    lineElements.inlineTagsText =
                        lineElements.commentText.slice(
                            lineElements.commentText.indexOf(
                                settings.TagBeginningConfig
                            ),
                            lineElements.commentText.length
                        );
                } else {
                    //if the tags are in the middle/beginning of the comment, tehn extract the text between the beginning of the tag and the specified end  of the tag
                    lineElements.inlineTagsText =
                        lineElements.commentText.slice(
                            lineElements.commentText.indexOf(
                                settings.TagBeginningConfig
                            ),
                            lineElements.commentText.lastIndexOf(
                                settings.TagEndConfig
                            )
                        );
                }

                //Remove the tags from the comment
                lineElements.commentText = lineElements.commentText
                    .replace(lineElements.inlineTagsText, "")
                    .trim();
            }

            //Check if there are any tags before performing manipulations of inlineTagsText

            if (typeof lineElements.inlineTagsText !== `undefined`) {
                //Remove the tag beginning and end marker from the inlineTagsText
                lineElements.inlineTagsText =
                    lineElements.inlineTagsText.replace(
                        settings.TagBeginningConfig,
                        ""
                    );

                if (settings.TagEndConfig.length != 0) {
                    lineElements.inlineTagsText =
                        lineElements.inlineTagsText.replace(
                            settings.TagEndConfig,
                            ""
                        );
                }

                //Split the different tags in an array if there are tags
                lineElements.inlineTagsArray =
                    lineElements.inlineTagsText.split(
                        settings.TagDividerConfig
                    );
            }
        } else {
            lineElements.rowEdited = selectedLine;
        }
        //Add the element to the array containing all the elements
        noteElements.push(lineElements);
    }
    return noteElements;
}




import * as fs from "fs";
import path from "path";
import { AnnotationElements, PluginSettings, ZoteroInfo } from "./types";
import { Notice, normalizePath } from "obsidian";

export function createFormatting(settings: PluginSettings) {
    const {
        highlightCustomTextAfter,
        highlightCustomTextBefore,
        isCommentItalic,
        isCommentBold,
        isCommentHighlighted,
        isCommentBullet,
        isCommentBlockquote,
        isCommentQuote,
        commentCustomTextAfter,
        commentCustomTextBefore,
        isHighlightItalic,
        isHighlightBold,
        isHighlightHighlighted,
        isHighlightBullet,
        isHighlightBlockquote,
        isHighlightQuote,
        tagCustomTextAfter,
        tagCustomTextBefore,
        isTagItalic,
        isTagBold,
        isTagHighlighted,
        isTagBullet,
        isTagBlockquote,
        isTagQuote,
        isTagHash,
    } = settings;

    //Set the formatting variables based on the highlightsettings
    const [
        highlightItalic,
        highlightBold,
        highlightHighlighted,
        highlightBullet,
        highlightBlockquote,
        highlightQuoteOpen,
        highlightQuoteClose,
    ] = [
            isHighlightItalic ? "*" : "",
            isHighlightBold ? "**" : "",
            isHighlightHighlighted ? "==" : "",
            isHighlightBullet ? "- " : "",
            isHighlightBlockquote ? "> " : "",
            isHighlightQuote ? "“" : "",
            isHighlightQuote ? "”" : "",
        ];

    const highlightFormatBefore =
        highlightHighlighted +
        highlightBold +
        highlightItalic +
        highlightQuoteOpen;

    const highlightFormatAfter =
        highlightQuoteClose +
        highlightItalic +
        highlightBold +
        highlightHighlighted +
        highlightCustomTextAfter;

    let highlightPrepend = "";
    if (highlightBullet != "" || highlightBlockquote != "") {
        highlightPrepend =
            "\n" +
            highlightBullet +
            highlightBlockquote +
            highlightCustomTextBefore;
    }

    //Set the formatting variables based on the comments settings
    const commentItalic = isCommentItalic ? "*" : "";
    const commentBold = isCommentBold ? "**" : "";
    const commentHighlighted = isCommentHighlighted ? "==" : "";
    const commentBullet = isCommentBullet ? "- " : "";
    const commentBlockquote = isCommentBlockquote ? "> " : "";
    const commentQuoteOpen = isCommentQuote ? "“" : "";
    const commentQuoteClose = isCommentQuote ? "”" : "";

    //Create formatting to be added before and after highlights
    const commentFormatBefore =
        commentHighlighted + commentBold + commentItalic + commentQuoteOpen;

    const commentFormatAfter =
        commentQuoteClose +
        commentItalic +
        commentBold +
        commentHighlighted +
        commentCustomTextAfter;

    let commentPrepend = "";
    if (commentBullet != "" || commentBlockquote != "") {
        commentPrepend =
            "\n" +
            commentBullet +
            commentBlockquote +
            commentCustomTextBefore;
    }

    //Set the tag formatting variables based on the tag settings
    const [
        tagHash,
        tagItalic,
        tagBold,
        tagHighlighted,
        tagBullet,
        tagBlockquote,
        tagQuoteOpen,
        tagQuoteClose,
    ] = [
            isTagHash ? "#" : "",
            isTagItalic ? "*" : "",
            isTagBold ? "**" : "",
            isTagHighlighted ? "==" : "",
            isTagBullet ? "- " : "",
            isTagBlockquote ? "> " : "",
            isTagQuote ? "“" : "",
            isTagQuote ? "”" : "",
        ];

    const tagFormatBefore =
        tagHash + tagHighlighted + tagBold + tagItalic + tagQuoteOpen;

    const tagFormatAfter =
        tagQuoteClose +
        tagItalic +
        tagBold +
        tagHighlighted +
        tagCustomTextAfter;

    let tagPrepend = "";
    if (tagBullet != "" || tagBlockquote != "") {
        tagPrepend = "\n" + tagBullet + tagBlockquote + tagCustomTextBefore;
    } else {
        tagPrepend = tagBullet + tagBlockquote + tagCustomTextBefore;
    }

    return {
        highlightFormatBefore,
        highlightFormatAfter,
        highlightPrepend,
        commentFormatBefore,
        commentFormatAfter,
        commentPrepend,
        tagFormatBefore,
        tagFormatAfter,
        tagPrepend,
    };
}

export function formatNoteElements(
    noteElements: AnnotationElements[],
    citeKey: string,
    settings: PluginSettings,
    zoteroInfo: ZoteroInfo
) {
    const { isDoubleSpaced } = settings;

    const {
        commentFormatAfter,
        commentFormatBefore,
        commentPrepend,
        highlightFormatAfter,
        highlightFormatBefore,
        highlightPrepend,
        tagFormatBefore,
        tagFormatAfter,
        tagPrepend,
    } = createFormatting(settings);

    //Create an index of rows to be removed
    const indexRowsToBeRemoved: number[] = [];

    //Create elements with subset of highlights/notes to be exported
    const noteElementsArray: AnnotationElements[] = [];
    const keywordArray: string[] = [];
    const rowEditedArray: string[] = [];
    //Create vector with annotation highlighted in different colour
    const imagesArray: string[] = [];

    //Remove undefined elements
    noteElements = noteElements.filter((x) => x !== undefined);
    //Run a loop, processing each annotation line one at the time

    for (let i = 0; i < noteElements.length; i++) {
        //Select one element to process
        let lineElements = noteElements[i];

        //Run the function to extract the transformation associated with the highlighted colour
        // lineElements = formatColourHighlight(lineElements);

        //Extract the citation format from the settings
        if (
            lineElements.extractionSource === "zotero" ||
            lineElements.extractionSource === "zotfile"
        ) {
            if (
                settings.highlightCitationsFormat ===
                "Only page number" &&
                lineElements.pageLabel !== undefined
            ) {
                lineElements.citeKey =
                    "" + lineElements.pageLabel
            } else if (
                settings.highlightCitationsFormat === "Pandoc" &&
                lineElements.pageLabel !== undefined
            ) {
                lineElements.citeKey =
                    "[@" + citeKey + ", Page: " + lineElements.pageLabel + "]";
            } else if (
                settings.highlightCitationsFormat === "Pandoc" &&
                lineElements.pageLabel === undefined
            ) {
                lineElements.citeKey = "[@" + citeKey + "]";
            } else if (
                settings.highlightCitationsFormat === "Empty" &&
                lineElements.pageLabel !== undefined
            ) {
                lineElements.citeKey = " ";
            }
        }
        //Edit the backlink to Zotero based on the settings
        if (
            settings.highlightCitationsLink === true &&
            lineElements.zoteroBackLink.length > 0
        ) {
            if (settings.highlightCitationsFormat !== "Pandoc") {
                lineElements.citeKey =
                    "[" + lineElements.citeKey + "](" + lineElements.zoteroBackLink + ")";
                lineElements.zoteroBackLink = " [" + lineElements.pagePDF + "](" + lineElements.zoteroBackLink + ")";
            } else {
                lineElements.citeKey =
                    lineElements.citeKey + " [" + lineElements.pagePDF + "](" + lineElements.zoteroBackLink + ")";
                lineElements.zoteroBackLink =
                    " [" + lineElements.pagePDF + "](" + lineElements.zoteroBackLink + ")";
            }
        } else {
            lineElements.zoteroBackLink = "";
        }

        //Extract the custom language assocaited with the highlight colour
        let colourTextBefore = lineElements.colourTextBefore;
        if (colourTextBefore == undefined) {
            colourTextBefore = "";
        }
        let colourTextAfter = lineElements.colourTextAfter;
        if (colourTextAfter == undefined) {
            colourTextAfter = "";
        }

        //Identify the headings exported by Zotero
        if (lineElements.highlightText === "Extracted Annotations") {
            lineElements.annotationType = "typeExtractedHeading";
        }

        //FORMAT THE HEADINGS IDENTIFIED BY ZOTERO
        //Transforms headings exported by Zotero into H3 (this could be changed later)
        if (lineElements.annotationType === "typeExtractedHeading") {
            lineElements.rowEdited =
                "**" + lineElements.rowOriginal.toUpperCase() + "**";
        }

        // ADD FORMATTING TO THE HIGHLIGHTS
        if (lineElements.highlightText != "") {
            lineElements.highlightFormatted =
                highlightPrepend +
                highlightFormatBefore +
                lineElements.highlightText +
                highlightFormatAfter +
                " " +
                lineElements.citeKey +
                " ";
            lineElements.highlightFormattedNoPrepend =
                highlightFormatBefore +
                lineElements.highlightText +
                highlightFormatAfter +
                " " +
                lineElements.citeKey +
                " ";
        } else {
            lineElements.highlightFormatted = "";
            lineElements.highlightFormattedNoPrepend = "";
        }

        // ADD FORMATTING TO THE COMMENTS
        if (
            lineElements.commentText != "" &&
            lineElements.highlightText != ""
        ) {
            lineElements.commentFormatted =
                commentPrepend +
                commentFormatBefore +
                lineElements.commentText +
                commentFormatAfter +
                " ";
            lineElements.commentFormattedNoPrepend =
                commentFormatBefore +
                lineElements.commentText +
                commentFormatAfter +
                " ";
        }
        //Add Citation to the comment if the highlight is empty
        else if (
            lineElements.commentText != "" &&
            lineElements.highlightText == ""
        ) {
            lineElements.commentFormatted =
                commentPrepend +
                commentFormatBefore +
                lineElements.commentText +
                commentFormatAfter +
                " " +
                lineElements.zoteroBackLink +
                " ";
            lineElements.commentFormattedNoPrepend =
                commentFormatBefore +
                lineElements.commentText +
                commentFormatAfter +
                " " +
                lineElements.zoteroBackLink +
                " ";
        } else {
            lineElements.commentFormatted = "";
            lineElements.commentFormattedNoPrepend = "";
        }

        // ADD FORMATTING TO THE ZOTERO INLINE TAGS
        //if the hash is added to the tag, then remove empty spaces
        if (typeof lineElements.inlineTagsArray == "undefined") {
            lineElements.inlineTagsArray = [];
        }

        if (settings.isTagHash == true) {
            for (
                let index = 0;
                index < lineElements.inlineTagsArray.length;
                index++
            ) {
                lineElements.inlineTagsArray[index] =
                    lineElements.inlineTagsArray[index].replace(/ /g, "");
            }
            //{}
        }

        const TempTag = lineElements.inlineTagsArray.map(
            (i) => tagPrepend + tagFormatBefore + i + tagFormatAfter
        );
        // if there are two tags, remove one

        //format the tags so that only the hash sign is added only if there was not one already
        for (let index = 0; index < TempTag.length; index++) {
            TempTag[index] = TempTag[index].replace("##", "#");
            //if(settings.isTagHash==true){TempTag[index] = TempTag[index].replace(" ", "")}
        }

        const TempTagNoPrepend = lineElements.inlineTagsArray.map(
            (i) => tagFormatBefore + i + tagFormatAfter
        );
        for (let index = 0; index < TempTagNoPrepend.length; index++) {
            TempTagNoPrepend[index] = TempTagNoPrepend[index].replace(
                "##",
                "#"
            );
            //if(settings.isTagHash==true){TempTagNoPrepend[index] = TempTagNoPrepend[index].replace(" ", "")}
        }

        // Check if there are any inline tags
        function allAreEmpty(arr: string[]) {
            return arr.every((element) => element == "");
        }

        // If there are inline tags, format them. otherwise create empty element
        if (allAreEmpty(lineElements.inlineTagsArray) == false) {
            lineElements.inlineTagsFormatted = TempTag.join(" ");
            // lineElements.inlineTagsFormatted = lineElements.inlineTagsFormatted + settings.tagCustomTextAfterLast;

            lineElements.inlineTagsFormattedNoPrepend =
                TempTagNoPrepend.join(" ");
            // lineElements.inlineTagsFormatted = lineElements.inlineTagsFormatted + settings.tagCustomTextAfterLast;
        } else {
            lineElements.inlineTagsFormatted = "";
            lineElements.inlineTagsFormattedNoPrepend = "";
        }

        //Extract from the setting the template for exporitng the highlight/comment/tag for different colours
        if (typeof lineElements.colourTemplate == "undefined") {
            lineElements.colourTemplate =
                settings.highlightExportTemplate;
        }

        if (lineElements.colourTemplate.length == 0) {
            lineElements.colourTemplate = "";
        }

        lineElements.colourTemplateFormatted =
            lineElements.colourTemplate.replace(
                "{{highlight}}",
                lineElements.highlightFormatted
            );
        lineElements.colourTemplateFormatted =
            lineElements.colourTemplateFormatted.replace(
                "{{comment}}",
                lineElements.commentFormatted
            );
        lineElements.colourTemplateFormatted =
            lineElements.colourTemplateFormatted.replace(
                "{{tag}}",
                lineElements.inlineTagsFormatted
            );
        //lineElements.colourTemplate = lineElements.colourTemplate + "\n"
        lineElements.colourTemplateFormatted =
            lineElements.colourTemplateFormatted.replace(/^\s+/g, "");

        // Extract from the setting the template for exporitng the 
        // highlight/comment/tag for different colours but without prepend signs. This can be used to create tasks/heading
        lineElements.colourTemplateNoPrepend =
            lineElements.colourTemplate.replace(
                "{{highlight}}",
                lineElements.highlightFormattedNoPrepend
            );
        lineElements.colourTemplateNoPrepend =
            lineElements.colourTemplateNoPrepend.replace(
                "{{comment}}",
                lineElements.commentFormattedNoPrepend
            );
        lineElements.colourTemplateNoPrepend =
            lineElements.colourTemplateNoPrepend.replace(
                "{{tag}}",
                lineElements.inlineTagsFormattedNoPrepend
            );
        //lineElements.colourTemplate = lineElements.colourTemplate + "\n"
        lineElements.colourTemplateNoPrepend =
            lineElements.colourTemplateNoPrepend.replace(/^\s+/g, "");

        //FORMAT HIGHLIGHTED SENTENCES WITHOUT ANY COMMENT
        //OR WITHOUT ANY SPECIAL CONSIDERATIONS
        if (lineElements.annotationType === "noKey") {
            lineElements.rowEdited = lineElements.colourTemplateFormatted;
        }

        //FORMAT IMAGES
        if (lineElements.annotationType === "typeImage") {
            lineElements.rowEdited = "";
            let pathImageOld = "";
            let pathImageNew = "";
            if (settings.imagesImport) {
                // Check if the user settings has approved the importing of images

                pathImageOld = path.format({
                    dir: zoteroInfo.pathZoteroStorage + lineElements.imagePath,
                    base: "image.png",
                });

                // If the path of the existing images has been defined in the settings, then take that
                if (settings.zoteroStoragePathManual.length > 0) {
                    pathImageOld = path.format({
                        dir:
                            settings.zoteroStoragePathManual +
                            lineElements.imagePath,
                        base: "image.png",
                    });
                }

                pathImageNew = path.normalize(
                    path.format({
                        dir: normalizePath(
                            // create new path with the rootpath + settings.imagesPath
                            //@ts-ignore
                            this.app.vault.adapter.getBasePath() +
                            "\\" +
                            settings.imagesPath
                        ),
                        base:
                            citeKey + "_" + lineElements.imagePath + ".png",
                    })
                );
                if (zoteroInfo.zoteroBuildWindows == false) {
                    pathImageNew = "/" + pathImageNew;
                }

                //Check if the image exists within Zotero or already within the vault
                if (
                    // replaced fs.existsSync with the obsidian adapter
                    fs.existsSync(pathImageOld)
                ) {
                    //if the settings is to link to the image in the zotero folder
                    if (settings.imagesCopy === false) {
                        lineElements.rowEdited =
                            "![image](file://" + encodeURI(pathImageOld) + ")" + lineElements.zoteroBackLink;
                    }
                    //if the settings is to copy the image from Zotero to the Obsidian vault
                    else {
                        //if the file has not already been copied
                        if (!fs.existsSync(pathImageNew)) {
                            fs.copyFile(
                                pathImageOld,
                                pathImageNew,
                                (err) => {
                                    if (err) throw err;
                                }
                            );
                        }
                        lineElements.rowEdited =
                            "![[" +
                            citeKey +
                            "_" +
                            lineElements.imagePath +
                            ".png]] " +
                            lineElements.citeKey;
                    }
                } else {
                    new Notice(
                        `Cannot find image at "${pathImageOld}". Provide the correct zotero data directory location in the settings`
                    );
                }
            }

            //Add the comment after the image
            if (lineElements.commentText.length > 0) {
                if (
                    settings.imagesCommentPosition == "Below the image"
                ) {
                    lineElements.rowEdited =
                        lineElements.rowEdited +
                        "\n" +
                        "\n" +
                        lineElements.commentFormatted +
                        lineElements.inlineTagsFormatted;
                } else {
                    lineElements.rowEdited =
                        lineElements.commentFormatted +
                        lineElements.inlineTagsFormatted +
                        "\n" +
                        "\n" +
                        lineElements.rowEdited;
                }
            }
        }
        // MERGE HIGHLIGHT WITH THE PREVIOUS ONE ABOVE
        if (lineElements.annotationType === "typeMergeAbove") {
            noteElements[i].rowEdited =
                noteElements[i - 1].rowEdited
                    .replace(/\[.*\)/, "")
                    .replace(/\s+$/g, "") +
                " " +
                lineElements.highlightFormattedNoPrepend.replace(
                    /^\s+/g,
                    ""
                ) +
                lineElements.commentFormatted +
                lineElements.inlineTagsFormatted;

            //Add the highlighted text to the previous one
            indexRowsToBeRemoved.push(i - 1);
        }

        //PREPEND COMMENT TO THE HIGHLIGHTED SENTENCE
        //check the setting commentPrependDefault. If true, then everytime there is an highlight with a comment, prepend the comment to the highlight
        if (
            settings.commentPrependDefault === true &&
            lineElements.highlightText !== "" &&
            lineElements.commentText !== ""
        ) {
            lineElements.annotationType = "typeCommentPrepend";
        }
        //commentPrependDefault
        if (lineElements.annotationType === "typeCommentPrepend") {
            //add the comment before the highlight
            lineElements.rowEdited =
                highlightPrepend +
                lineElements.commentFormattedNoPrepend +
                lineElements.highlightFormattedNoPrepend +
                lineElements.inlineTagsFormatted;
        }

        // 	FORMAT THE HEADERS
        //  Transform header in H1/H2/H3/H4/H5/H6 Level
        if (/typeH\d/.test(lineElements.annotationType)) {
            const lastChar =
                lineElements.annotationType[
                lineElements.annotationType.length - 1
                ];
            const level = parseInt(lastChar);
            const hashes = "#".repeat(level);
            lineElements.rowEdited =
                `${hashes} ` +
                lineElements.highlightText +
                lineElements.commentText +
                lineElements.zoteroBackLink +
                lineElements.inlineTagsFormatted;
        }

        //Create Task
        if (lineElements.annotationType == "typeTask") {
            lineElements.rowEdited =
                `- [ ] ` + lineElements.colourTemplateNoPrepend;
        }

        //FORMAT KEYWORDS
        // Add highlighted expression to KW
        if (lineElements.annotationType === "typeKeyword") {
            keywordArray.push(lineElements.highlightText);

            //remove the text of the line
            lineElements.rowEdited = "";

            //Add the line to an index of lines to be removed
            indexRowsToBeRemoved.push(i);
        }

        //Copy the edited text into an array to be exported
        noteElementsArray.push(lineElements);
    }

    // PERFORM THE FOLLOWING OPERATIONS ON THE WHOLE ARRAY

    // Remove the rows with the keywords and other rows to be removed
    if (indexRowsToBeRemoved.length) {
        for (
            let index = indexRowsToBeRemoved.length - 1;
            index >= 0;
            index--
        ) {
            noteElementsArray.splice(indexRowsToBeRemoved[index], 1);
        }
    }

    //Add rowEdited into different arrays for the export
    for (let index = 0; index < noteElementsArray.length; index++) {
        const selectedLine = noteElementsArray[index];
        rowEditedArray.push(selectedLine.rowEdited);

        //Copy the images in a specific array
        if (selectedLine.annotationType === "typeImage") {
            imagesArray.push(selectedLine.rowEdited);
        }
    }

    // Add empty row in between rows if selected in the settings
    if (isDoubleSpaced) {
        for (let index = rowEditedArray.length - 1; index >= 0; index--) {
            rowEditedArray.splice(index, 0, "");
        }
    }

    //Export the different arrays with the rowEdited
    const resultsLineElements = {
        rowEditedArray: rowEditedArray,
        keywordArray: keywordArray,
        imagesArray: imagesArray,
        noteElements: noteElements,
    };
    return resultsLineElements;
}

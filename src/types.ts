export interface ZoteroAnnotationsSettings {
    bibPath: string;
    templateContent: string;
    templatePath: string;
    templateType: string;
    importPath: string;
    importFileName: string;
    importAllAnnotationFiles: boolean;
    missingfield: string;
    saveManualEdits: string;
    saveManualEditsStart: string;
    saveManualEditsEnd: string;
    openAfterImport: boolean;
    imagesImport: boolean;
    imagesCopy: boolean;
    imagesPath: string;
    imagesCommentPosition: string;
    formatMergeAbove: string;
    formatCommentPrepend: string;
    commentPrependDefault: boolean;
    TagBeginningConfig: string;
    TagEndConfig: string;
    TagDividerConfig: string;
    formatH1: string;
    formatH2: string;
    formatH3: string;
    formatH4: string;
    formatH5: string;
    formatH6: string;
    formatKeyword: string;
    formatTask: string;
    lastUpdateDate: Date;
    updateNotes: string;
    isHighlightItalic: boolean;
    isHighlightBold: boolean;
    isHighlightHighlighted: boolean;
    isHighlightBullet: boolean;
    isHighlightBlockquote: boolean;
    isHighlightQuote: boolean;
    highlightCustomTextBefore: string;
    highlightCustomTextAfter: string;
    isCommentItalic: boolean;
    isCommentBold: boolean;
    isCommentHighlighted: boolean;
    isCommentBullet: boolean;
    isCommentBlockquote: boolean;
    isCommentQuote: boolean;
    commentCustomTextBefore: string;
    commentCustomTextAfter: string;
    isTagItalic: boolean;
    isTagBold: boolean;
    isTagHighlighted: boolean;
    isTagBullet: boolean;
    isTagBlockquote: boolean;
    isTagQuote: boolean;
    isTagHash: boolean;
    tagCustomTextBefore: string;
    tagCustomTextAfter: string;
    tagCustomTextBeforeFirst: string;
    tagCustomTextAfterLast: string;
    isDoubleSpaced: boolean;
    highlightExportTemplate: string;
    multipleFieldsDivider: string;
    nameFormat: string;
    highlightCitationsFormat: string;
    highlightCitationsLink: boolean;
    debugMode: boolean;
    zoteroStoragePathManual: string;
    missingfieldreplacement: string;
}

export interface Reference {
    authorKey: string;
    authorKeyInitials: string;
    authorKeyFullName: string;
    id: number;
    citationKey: string;
    year: string;
    citationInLine: string;
    citationInLineInitials: string;
    citationInLineFullName: string;
    citationShort: string;
    citationFull: string;
    itemType: string;
    inlineReference: string;
    date: string;
    dateModified: string;
    itemKey: string;
    itemID: number;
    title: string;
    publicationTitle: string;
    volume: number;
    issue: number;
    pages: string;
    creators: {
        creatorType: string;
        firstName: string;
        lastName: string;
        name: string;
    }[];
    file: string;
    localLibrary: string;
    localLibraryLink: string;
    select: string;
    attachments: {
        dateAdded: string;
        dateModified: string;
        itemType: string;
        path: string;
        relations: string[];
        tags: string[];
        title: string;
        uri: string;
    }[];
    notes: {
        dateAdded: string;
        dateModified: string;
        itemType: string;
        key: string;
        note: string;
        parentItem: "VMSSFNIR";
        relations: string[];
        tags: string[];
        uri: string;
        version: number;
    }[];
    tags: {
        tag: string;
    }[];
    zoteroTags: string[];
}

export interface AnnotationElements {
    annotationType: string;
    citeKey: string;
    commentText: string;
    commentFormatted: string;
    commentFormattedNoPrepend: string;
    highlightText: string;
    highlightColour: string;
    highlightFormatted: string;
    highlightFormattedNoPrepend: string;
    inlineTagsText: string;
    inlineTagsArray: string[];
    inlineTagsFormatted: string;
    inlineTagsFormattedNoPrepend: string;
    indexNote: number;
    rowOriginal: string;
    rowEdited: string;
    foundOld: boolean;
    positionOld: number;
    extractionSource: string;
    colourTemplate: string;
    colourTemplateFormatted: string;
    colourTemplateNoPrepend: string;
    colourTextBefore: string;
    colourTextAfter: string;
    imagePath: string;
    pagePDF: number;
    pageLabel: number;
    attachmentURI: string;
    zoteroBackLink: string;
    annotationKey: string;
}
[];

export interface Creator {
    creatorType: string;
    firstName: string;
    lastName: string;
    name: string;
}

export interface Collection {
    collections: string[];
    items: string[];
    key: string;
    name: string;
    parent: string;
}

export interface ZoteroInfo {
    pathZoteroStorage: string;
    zoteroBuildWindows: boolean;
}

export type CreatorArray = Array<Creator>;

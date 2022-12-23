import { MyPluginSettings } from "./types";

export const templatePlain = `

# {{title}}

## Metadata
- **CiteKey**: {{citekey}}
- **Type**: {{itemType}}
- **Title**: {{title}} 
- **Author**: {{author}}  
- **Editor**: {{editor}}  
- **Translator**: {{translator}}
- **Publisher**: {{publisher}}
- **Location**: {{place}}
- **Series**: {{series}}
- **Series Number**: {{seriesNumber}}
- **Journal**: {{publicationTitle}}
- **Volume**: {{volume}}
- **Issue**: {{issue}}
- **Pages**: {{pages}}
- **Year**: {{year}} 
- **DOI**: {{DOI}}
- **ISSN**: {{ISSN}}
- **ISBN**: {{ISBN}}

## Abstract
{{abstractNote}}" +

## Files and Links
- **Url**: {{url}}
- **Uri**: {{uri}}
- **Eprint**: {{eprint}}
- **File**: {{file}}
- **Local Library**: [Zotero]({{localLibraryLink}})

## Tags
- **Keywords**: {{keywordsAll}}

## Notes

## Comments
{{UserNotes}}

## Annotations
{{PDFNotes}}
`;

export const DEFAULT_SETTINGS: MyPluginSettings = {
    bibPath: "",
    templateContent: templatePlain,
    templatePath: "",
    templateType: "Admonition",
    lastUpdateDate: new Date("1995-12-17T03:24:00"),
    updateLibrary: "Only update existing notes",
    exportPath: "",
    exportTitle: "@{{citeKey}}",
    missingfield: "Leave placeholder",
    saveManualEdits: "Overwrite Entire Note",
    saveManualEditsStart: "",
    saveManualEditsEnd: "",
    openAfterImport: false,
    imagesImport: true,
    imagesCopy: false,
    imagesPath: "",
    imagesCommentPosition: "Above the image",
    keyMergeAbove: "+",
    keyCommentPrepend: "%",
    commentPrependDefault: false,
    // commentPrependDivider: ": ",
    // commentAppendDivider: "-> ",
    TagBeginningConfig: "Tag: ",
    TagEndConfig: "",
    TagDividerConfig: "; ",
    keyH1: "#",
    keyH2: "##",
    keyH3: "###",
    keyH4: "####",
    keyH5: "#####",
    keyH6: "######",
    keyKeyword: "=",
    keyTask: "todo",
    isHighlightItalic: true,
    isHighlightBold: false,
    isHighlightHighlighted: false,
    isHighlightBullet: true,
    isHighlightBlockquote: false,
    isHighlightQuote: true,
    highlightCustomTextBefore: "",
    highlightCustomTextAfter: "",
    isCommentItalic: false,
    isCommentBold: true,
    isCommentHighlighted: false,
    isCommentBullet: false,
    isCommentBlockquote: true,
    isCommentQuote: false,
    commentCustomTextBefore: "",
    commentCustomTextAfter: "",
    isTagItalic: false,
    isTagBold: false,
    isTagHighlighted: false,
    isTagBullet: false,
    isTagBlockquote: false,
    isTagQuote: false,
    isTagHash: true,
    tagCustomTextBefore: "#",
    tagCustomTextAfter: "",
    tagCustomTextBeforeFirst: "",
    tagCustomTextAfterLast: "",
    isDoubleSpaced: true,
    highlightExportTemplate: "{{highlight}} {{comment}} {{tag}}",
    multipleFieldsDivider: ",",
    nameFormat: "{{lastName}}, {{firstName}}",
    highlightCitationsFormat: "Author, year, page number",
    highlightCitationsLink: true,
    debugMode: false,
    zoteroStoragePathManual: "",
    missingfieldreplacement: "NA",
};

export enum HeaderLevels {
    "typeH1" = 1,
    "typeH2" = 2,
    "typeH3" = 3,
    "typeH4" = 4,
    "typeH5" = 5,
    "typeH6" = 6,
}

export const TEMPLATE_REG = /\{\{[^}]+\}\}/g;
export const TEMPLATE_BRACKET_REG = /\[\[\{\{[^}]+\}\}\]\]/g;

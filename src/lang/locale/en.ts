// English
export default {
  JSON_FILE_PATH: "JSON File Path",
  JSON_FILE_PATH_DESC: "Add relative path from the vault folder to the <b><a href='https://retorque.re/zotero-better-bibtex/'>Better BibTeX</a> JSON</b> file generated for your Zotero library.",
  JSON_FILE_PATH_PLACEHOLDER: "path/to/zotero.json",
  IMPORT_NOTES_FOLDER: "Import Notes Folder",
  IMPORT_NOTES_FOLDER_DESC: "Add relative path from the vault folder to the folder where you want to import the notes.",
  IMPORT_NOTES_FOLDER_PLACEHOLDER: "path/to/folder",
  NOTE_FILE_NAME: "Note File Name",
  NOTE_FILE_NAME_DESC:
    "Add the name of the note file. You can use the following placeholders:<br>" +
    "<code>{{citeKey}}</code>, <code>{{title}}</code>, <code>{{author}}</code>,<code>{{authorInitials}}</code>, <code>{{authorFullName}}</code> <code>{{year}}</code>",
  NOTE_FILE_NAME_PLACEHOLDER: "{{citeKey}}",
  TEMPLATE_FILE: "Template File",
  TEMPLATE_FILE_DESC:
    "Add relative path from the vault folder to the template file <b>without</b> the file extension.<br>" +
    " If left empty, the default template will be used.",
  TEMPLATE_FILE_PLACEHOLDER: "path/to/template",
  MISSING_FIELDS: "Missing fields",
  MISSING_FIELDS_DESC: "Rule to handle fields that are present in the template but missing in the Zotero library.",
  REPLACE_MISSING_FIELDS: "Custom text replacement for missing fields",
  FORMAT_CREATOR_NAMES: "Format Creator Names",
  FORMAT_CREATOR_NAMES_DESC:
    "Specify how the names of the authors/editors should be imported.<br>" + "Accepted values are <code>{{firstName}}</code>, <code>{{lastName}}</code> and <code>{{firstNameInitials}}</code>",
  MULTIPLE_ENTRIES_DELIMITER: "Multiple Entries Delimiter",
  MULTIPLE_ENTRIES_DELIMITER_DESC:
    "Specify the character or expression that should separate multiple values.<br>" +
    "Values such as  authors, editors, tags, collections, etc.",
  CREATE_BACKLINKS: "Attach Link to the PDF",
  CREATE_BACKLINKS_DESC:
    "Attach link with the extracted highlights or figures to the original page of the PDF.<br>" +
    "<b>Toggle ON:</b> Attach link to the highlighted page<br>" +
    "<b>Toggle OFF:</b> Omit the link to the highlighted page",
  FORMAT_BACKLINKS: "Format Zotero Backlinks",
  FORMAT_BACKLINKS_DESC: "Specify how the backlinks should be formatted, if <b>Attach Link to the PDF</b> option is turned on.",
  ORDER_OF_EXTRACTED_ELEMENT: "Order of Extracted Element",
  ORDER_OF_EXTRACTED_ELEMENT_DESC: "Specify the arrangement order of the elements <code>{{highlight}}</code> <code>{{comment}}</code>and <code>{{tag}}</code>",
  MULTIPLE_ANNOTATION_FILES: "Multiple Annotation Notes",
  MULTIPLE_ANNOTATION_FILES_DESC:
    "Specify whether to import all annotation files associated with a reference or the latest note.<br>" +
    "<b>Toggle ON:</b>  Import All annotation notes <br>" +
    "<b>Toggle OFF:</b> Import the latest annotation note",
  NOTE_UPDATE_PRESERVATION: "Note Update Preservation",
  NOTE_UPDATE_PRESERVATION_DESC:
    "Specify whether to preserve the existing notes or overwrite them with the imported notes.<br>" +
    "<b>Overwrite Entire Note:</b> No manual edits or notes from before is preserved.<br>" +
    "<b>Select Section:</b> Will preserve contents that are inside the choosen sections.",
  PRESERVATION_SECTION_START: "Preservation Section Start",
  PRESERVATION_SECTION_START_DESC: "Specify the start of the section that should be preserved.(e.g. <code>## Notes</code>)",
  PRESERVATION_SECTION_END: "Preservation Section End",
  PRESERVATION_SECTION_END_DESC: "Specify the end of the section that should be preserved.(e.g. <code>## Comments</code>)",
  OPEN_UPDATED_NOTE: "Open Updated Note",
  OPEN_UPDATED_NOTE_DESC: "Specify whether to open the updated note after the import process is complete.<br>" +
    "<b>Toggle ON:</b> Open the updated note <br>" +
    "<b>Toggle OFF:</b> Do not open the updated note",
  UPDATE_ALL_NOTES: "Update Existing or All Notes",
  UPDATE_ALL_NOTES_DESC:
    "Specify the rule for batch updating the notes.<br>" +
    "<b>Only existing notes:</b> Update only the notes that are already present in the vault.<br>" +
    "<b>Create when missing:</b> Update and create notes if annotation is available in the Zotero library.<br>",
  EMBED_IMAGES: "Embed highlighted Images",
  EMBED_IMAGES_DESC: "This option is available only for notes extracted using the Zotero native PDF reader.<br>" +
    "<b>Toggle ON:</b> Embed highlighted images in the note.<br>" +
    "<b>Toggle OFF:</b> Do not embed highlighted images in the note.",
  IMAGE_COPY: "Copy Images to Vault",
  IMAGE_COPY_DESC: "Specify whether to copy the zotero reader highlighted images to the Obsidian vault.<br>" +
    "<b>Toggle ON:</b> Copy highlighted images to the vault.<br>" +
    "<b>Toggle OFF:</b> Keep highlighted images in Zotero Library and embed from there.",
  IMAGE_COPY_PATH: "Image Copy Path",
  IMAGE_COPY_PATH_DESC: "Specify the relative path from the vault folder to the folder where the images should be copied.",
  POSITION_OF_IMAGE_COMMENT: "Position of Image Comment",
  POSITION_OF_IMAGE_COMMENT_DESC:
    "Specify the position of the image comment in the note.<br>" +
    "<b>Above the image:</b> Comment will be placed above the image.<br>" +
    "<b>Below the image:</b> Comment will be placed below the image.",
  ZOTERO_LOCAL_FOLDER: "Zotero Local Folder",
  ZOTERO_LOCAL_FOLDER_DESC: "Specify the path to the Zotero local storage folder. <br>" +
    "This field is required only when this is different from the folder where the PDF files are stored.<br>" +
    "To retrieve this information, open <code>Zotero -> Preferences -> Advanced -> Files and Folder </code>, and copy the <b>data directory location</b>, followed by the subdirectory <code>/storage</code>"
};

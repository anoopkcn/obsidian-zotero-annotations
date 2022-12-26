import { Creator, CreatorArray } from "./types";
import { getInitials, makeQuotes, makeWiki, replaceTemplate } from "./utils";


export const getCreatorKey = (creators: CreatorArray) => {
    const authorKey: string[] = [];
    const editorKey: string[] = [];
    let authorKeyFixed = "";
    let editorKeyFixed = "";
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex];
        const isFirstName = creator.hasOwnProperty("firstName");
        const isLastName = creator.hasOwnProperty("lastName");

        if (creator.creatorType === "author") {
            if (creator.hasOwnProperty("name")) authorKey.push(creator.name)
            else if (isLastName && isFirstName) authorKey.push(creator.lastName)
            else if (isLastName && !isFirstName) authorKey.push(creator.lastName)
            else if (!isLastName && isFirstName) authorKey.push(creator.firstName)
        } else if (creator.creatorType === "editor") {
            if (creator.hasOwnProperty("name")) editorKey.push(creator.name)
            else if (isLastName && isFirstName) editorKey.push(creator.lastName)
            else if (isLastName && !isFirstName) editorKey.push(creator.lastName)
            else if (!isLastName && isFirstName) editorKey.push(creator.firstName)

        }
    }

    //Adjust the authorKey depending on the number of authors
    if (authorKey.length == 1) authorKeyFixed = authorKey[0]
    if (authorKey.length == 2) authorKeyFixed = authorKey[0] + " and " + authorKey[1]
    if (authorKey.length == 3) authorKeyFixed = authorKey[0] + ", " + authorKey[1] + " and " + authorKey[2]
    if (authorKey.length > 3) authorKeyFixed = authorKey[0] + " et al."
    if (authorKey.length > 0) return authorKeyFixed
    //If there are no authors (because it is an edited book), 
    // then returns the name of the editors
    if (editorKey.length == 1) editorKeyFixed = editorKey[0]
    if (editorKey.length == 2) editorKeyFixed = editorKey[0] + " and " + editorKey[1]
    if (editorKey.length == 3) editorKeyFixed = editorKey[0] + ", " + editorKey[1] + " and " + editorKey[2]
    if (authorKey.length > 3) editorKeyFixed = editorKey[0] + " et al."
    if (editorKey.length > 0) return editorKeyFixed
};

export const getCreatorFullNames = (creators: CreatorArray) => {
    const authorKey: string[] = [];
    const authorKeyReverse: string[] = [];
    const editorKey: string[] = [];
    const editorKeyReverse: string[] = [];

    let authorKeyFixed = "";
    let editorKeyFixed = "";
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex]; //select the author

        const isFirstName = creator.hasOwnProperty("firstName")
        const isLastName = creator.hasOwnProperty("lastName")

        if (creator.creatorType === "author") {
            if (creator.hasOwnProperty("name")) {
                authorKey.push(creator.name);
            } else if (isLastName && isFirstName) {
                authorKey.push(creator.lastName + ", " + creator.firstName);
                authorKeyReverse.push(creator.firstName + " " + creator.lastName);
            } else if (isLastName && !isFirstName) {
                authorKey.push(creator.lastName);
            } else if (!isLastName && isFirstName) {
                authorKey.push(creator.firstName);
            }
        } else if (creator.creatorType === "editor") {
            if (creator.hasOwnProperty("name")) {
                editorKey.push(creator.name);
            } else if (isLastName && isFirstName) {
                editorKey.push(creator.lastName + ", " + creator.firstName);
                editorKeyReverse.push(creator.firstName + " " + creator.lastName);
            } else if (isLastName && !isFirstName) {
                editorKey.push(creator.lastName);
            } else if (!isLastName && isFirstName) {
                editorKey.push(creator.firstName);
            }
        }
    }

    //Adjust the authorKey depending on the number of authors
    if (authorKey.length == 1) { authorKeyFixed = authorKey[0]; }
    if (authorKey.length == 2) { authorKeyFixed = authorKey[0] + " and " + authorKeyReverse[1]; }
    // if (authorKey.length == 3) { authorKeyFixed = authorKey[0] + ", " + authorKeyReverse[1] + " and " + authorKeyReverse[2]; }
    if (authorKey.length >= 3) { authorKeyFixed = authorKey[0] + " et al."; }
    if (authorKey.length > 0) { return authorKeyFixed; }
    //If there are no authors (because it is an edited book), 
    // then returns the name of the editors
    if (editorKey.length == 1) { editorKeyFixed = editorKey[0]; }
    if (editorKey.length == 2) { editorKeyFixed = editorKey[0] + " and " + editorKeyReverse[1]; }
    // if (editorKey.length == 3) { editorKeyFixed = editorKey[0] + ", " + editorKeyReverse[1] + " and " + editorKeyReverse[2]; }
    if (authorKey.length >= 3) { editorKeyFixed = editorKey[0] + " et al."; }
    if (editorKey.length > 0) { return editorKeyFixed; }
};

export const getCreatorFullInitials = (creators: CreatorArray) => {
    const authorKey: string[] = [];
    const editorKey: string[] = [];
    let authorKeyFixed = "";
    let editorKeyFixed = "";
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex]; //select the author
        const isFirstName = creator.hasOwnProperty("firstName")
        const isLastName = creator.hasOwnProperty("lastName")

        if (creator.creatorType === "author") {
            if (creator.hasOwnProperty("name")) authorKey.push(creator.name)
            else if (isLastName && isFirstName) authorKey.push(creator.lastName + ", " + creator.firstName.substring(0, 1) + ".")
            else if (isLastName && !isFirstName) authorKey.push(creator.lastName)
            else if (!isLastName && isFirstName) authorKey.push(creator.firstName)
        } else if (creator.creatorType === "editor") {
            if (creator.hasOwnProperty("name")) editorKey.push(creator.name)
            else if (isLastName && isFirstName) editorKey.push(creator.lastName + ", " + creator.firstName.substring(0, 1) + ".")
            else if (isLastName && !isFirstName) editorKey.push(creator.lastName)
            else if (!isLastName && isFirstName) editorKey.push(creator.firstName)
        }
    }

    //Adjust the authorKey depending on the number of authors

    if (authorKey.length == 1) authorKeyFixed = authorKey[0]
    if (authorKey.length == 2) authorKeyFixed = authorKey[0] + " and " + authorKey[1]
    if (authorKey.length == 3) authorKeyFixed = authorKey[0] + ", " + authorKey[1] + " and " + authorKey[2]
    if (authorKey.length > 3) authorKeyFixed = authorKey[0] + " et al."
    if (authorKey.length > 0) return authorKeyFixed
    //If there are no authors (because it is an edited book), 
    // then returns the name of the editors
    if (editorKey.length == 1) editorKeyFixed = editorKey[0]
    if (editorKey.length == 2) editorKeyFixed = editorKey[0] + " and " + editorKey[1]
    if (editorKey.length == 3) editorKeyFixed = editorKey[0] + ", " + editorKey[1] + " and " + editorKey[2]
    if (authorKey.length > 3) editorKeyFixed = editorKey[0] + " et al."
    if (editorKey.length > 0) return editorKeyFixed
};

export const arrangeCreatorName = (
    creator: Creator,
    customName: string
) => {
    const isFirstName = creator.hasOwnProperty("firstName")
    const isLastName = creator.hasOwnProperty("lastName")

    if (creator.hasOwnProperty("name")) {
        return creator.name.trim();
    } else if (isLastName && isFirstName) {
        return customName
            .replace("{{lastName}}", creator.lastName)
            .replace("{{firstName}}", creator.firstName)
            .replace("{{firstNameInitials}}", getInitials(creator.firstName))
            .trim()
    } else if (isLastName && !isFirstName) {
        return customName
            .replace("{{lastName}}", creator.lastName)
            .replace("{{firstName}}", "")
            .trim()
    } else if (!isLastName && isFirstName) {
        return customName
            .replace("{{lastName}}", "")
            .replace("{{firstName}}", creator.firstName)
            .trim()
    }
}


//Function that create an array with the creators of a given type (e.g. author, editor)
export const insertCreatorList = (
    creators: CreatorArray,
    typeCreator: string,
    note: string,
    divider: string,
    nameFormat: string
) => {
    const creatorList: string[] = [];
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex]; //select the author
        if (creator.creatorType === typeCreator) { creatorList.push(arrangeCreatorName(creator, nameFormat)); }
    }

    const creatorListBracket = creatorList.map(makeWiki);
    const creatorListQuotes = creatorList.map(makeQuotes);
    //add a space after the divided if it is not present
    if (divider.slice(-1) !== " ") divider = divider + " "

    if (creatorList.length == 0) {
        return note;
    } else {
        note = replaceTemplate(note, `[[{{${typeCreator}}}]]`, creatorListBracket.join(divider));
        note = replaceTemplate(note, `"{{${typeCreator}}}"`, creatorListQuotes.join(divider));
        note = replaceTemplate(note, `{{${typeCreator}}}`, creatorList.join(divider));
        return note;
    }
};

export const insertCreatorAllList = (
    creators: CreatorArray,
    note: string,
    divider: string,
    nameFormat: string
) => {
    const creatorList: string[] = [];
    for (let creatorindex = 0; creatorindex < creators.length; creatorindex++) {
        const creator: Creator = creators[creatorindex]; //select the author
        creatorList.push(arrangeCreatorName(creator, nameFormat));
    }
    const creatorListBracket = creatorList.map(makeWiki);
    const creatorListQuotes = creatorList.map(makeQuotes);
    //add a space after the divided if it is not present
    if (divider.slice(-1) !== " ") divider = divider + " "

    if (creatorList.length == 0) {
        return note;
    } else {
        note = replaceTemplate(note, `[[{{creator}}]]`, creatorListBracket.join(divider));
        note = replaceTemplate(note, `"{{creator}}"`, creatorListQuotes.join(divider));
        note = replaceTemplate(note, `{{creator}}`, creatorList.join(divider));
        return note;
    }
};

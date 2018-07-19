import * as convert from "xml-js";

// tslint:disable:max-line-length
const rootAttributes = {
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xsi:schemaLocation": "urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd",
    "xmlns": "urn:oasis:names:tc:xliff:document:1.2",
    "version": "1.2",
};
// tslint:enable:max-line-length

function makeElement(name, attributes, elements) {
    const el: any = {
        type: "element",
        name: name,
    };
    if (attributes !== null && attributes !== undefined) {
        el.attributes = attributes;
    }
    if (Array.isArray(elements)) {
        el.elements = elements;
    } else if (elements === true) {
        el.elements = [];
    }
    return el;
}

function makeText(text) {
    return {
        type: "text",
        text,
    };
}

const map = {
    "&": "&amp;", // this must be the first !!!
    '"': "&quot;",
    "'": "&apos;",
    "<": "&lt;",
    ">": "&gt;",
};

function escape(str: string) {
    Object.keys(map).forEach((char) => {
        str = str.replace(new RegExp(char, "g"), map[char]);
    });
    return str;
}

const options = {
    spaces: "  ",
};

export class XliffSerializer {
    /**
     * @param translations Key value object containing the translations
     */
    public static encode(translations: StringMap<string>): string {
        const root = makeElement("xliff", rootAttributes, true);
        const body = makeElement("body", null, true);
        const fileAttributes = {
            "original": "Batch",
            "datatype": "plaintext",
            "source-language": "en",
        };

        const file = makeElement("file", fileAttributes, [body]);
        root.elements.push(file);

        for (const key of Object.keys(translations)) {
            const unit = makeElement("trans-unit", { id: escape(key) }, true);
            unit.elements.push(makeElement("source", null, [makeText(translations[key])]));
            body.elements.push(unit);
        }
        const xml = {
            elements: [root],
        };
        return convert.js2xml(xml, options);
    }
}

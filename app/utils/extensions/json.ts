interface JSON {
    minify(input: string): string;
}

interface RegExpConstructor {
    leftContext: string;
    rightContext: string;
}

if (!JSON.minify) {
    JSON.minify = (json) => {

        let tokenizer = /"|(\/\*)|(\*\/)|(\/\/)|\n|\r/g;
        let in_string = false;
        let in_multiline_comment = false;
        let in_singleline_comment = false;
        // tslint:disable-next-line:one-variable-per-declaration
        let tmp, tmp2, new_str = [], ns = 0, from = 0, lc, rc;

        tokenizer.lastIndex = 0;

        // tslint:disable-next-line:no-conditional-assignment
        while (tmp = tokenizer.exec(json)) {
            lc = RegExp.leftContext;
            rc = RegExp.rightContext;
            if (!in_multiline_comment && !in_singleline_comment) {
                tmp2 = lc.substring(from);
                if (!in_string) {
                    tmp2 = tmp2.replace(/(\n|\r|\s)*/g, "");
                }
                new_str[ns++] = tmp2;
            }
            from = tokenizer.lastIndex;

            if (tmp[0] === "\"" && !in_multiline_comment && !in_singleline_comment) {
                tmp2 = lc.match(/(\\)*$/);
                // start of string with ", or unescaped " character found to end string
                if (!in_string || !tmp2 || (tmp2[0].length % 2) === 0) {
                    in_string = !in_string;
                }
                from--; // include " character in next catch
                rc = json.substring(from);
            } else if (tmp[0] === "/*" && !in_string && !in_multiline_comment && !in_singleline_comment) {
                in_multiline_comment = true;
            } else if (tmp[0] === "*/" && !in_string && in_multiline_comment && !in_singleline_comment) {
                in_multiline_comment = false;
            } else if (tmp[0] === "//" && !in_string && !in_multiline_comment && !in_singleline_comment) {
                in_singleline_comment = true;
            } else if ((tmp[0] === "\n" || tmp[0] === "\r")
                && !in_string && !in_multiline_comment && in_singleline_comment) {
                in_singleline_comment = false;
            } else if (!in_multiline_comment && !in_singleline_comment && !(/\n|\r|\s/.test(tmp[0]))) {
                new_str[ns++] = tmp[0];
            }
        }
        new_str[ns++] = rc;
        return new_str.join("");
    };

}

import { XliffSerializer } from "./xliff-serializer";
/* eslint-disable max-len */

describe("XLiffSerializer", () => {
    it("Serialize english translations", () => {
        const translations = {
            "foo.bar": "Bar",
            "foo.potato": "Potato",
            "foo.random.banana": "Banana",
            "other": "Other",
        };
        const xliff = `<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd" xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
        <file original="Batch" datatype="plaintext" source-language="en">
          <body>
            <trans-unit id="foo.bar">
              <source>Bar</source>
            </trans-unit>
            <trans-unit id="foo.potato">
              <source>Potato</source>
            </trans-unit>
            <trans-unit id="foo.random.banana">
              <source>Banana</source>
            </trans-unit>
            <trans-unit id="other">
              <source>Other</source>
            </trans-unit>
          </body>
        </file>
      </xliff>`;
        expect(XliffSerializer.encode(translations).replace(/ /g, "")).toEqual(xliff.replace(/ /g, ""));
    });
});

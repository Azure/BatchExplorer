import { List } from "immutable";

import { Metadata } from "app/models";
import { ModelUtils } from "app/utils";
import { MetadataInternalKey } from "common/constants";

describe("ModelUtils", () => {
    describe("tagsFromMetadata", () => {
        it("read the tags from metadata", () => {
            const tags1 = ModelUtils.tagsFromMetadata(List([
                new Metadata({ name: "Metadata 1", value: "With value" }),
                new Metadata({ name: "Metadata 2", value: "With value" }),
                new Metadata({ name: MetadataInternalKey.tags, value: "tag1,tag2,some tag3" }),
            ]));
            expect(tags1.toJS()).toEqual(["tag1", "tag2", "some tag3"]);
            const tags2 = ModelUtils.tagsFromMetadata(List([
                new Metadata({ name: "Metadata 1", value: "With value" }),
                new Metadata({ name: "Metadata 2", value: "With value" }),
                new Metadata({ name: MetadataInternalKey.tags, value: "some tag3" }),
            ]));
            expect(tags2.toJS()).toEqual(["some tag3"]);
        });

        it("return no tags when input is not set", () => {
            const tags = ModelUtils.tagsFromMetadata(List([
                new Metadata({ name: "Metadata 1", value: "With value" }),
                new Metadata({ name: "Metadata 2", value: "With value" }),
            ]));
            expect(tags.toJS()).toEqual([]);
        });
    });

    describe("tagsFromMetadata", () => {
        it("add a tag attribute when not present", () => {
            const tags = List(["tag1", "tag2", "some tag3"]);
            const metadata = ModelUtils.updateMetadataWithTags(List([
                new Metadata({ name: "Metadata 1", value: "With value" }),
                new Metadata({ name: "Metadata 2", value: "With value" }),
            ]), tags);
            expect(metadata).toEqual([
                { name: "Metadata 1", value: "With value" },
                { name: "Metadata 2", value: "With value" },
                { name: MetadataInternalKey.tags, value: "tag1,tag2,some tag3" },
            ]);
        });

        it("replace a tag attribute when not present", () => {
            const tags = List(["tag1", "tag2", "some tag3"]);
            const metadata = ModelUtils.updateMetadataWithTags(List([
                new Metadata({ name: "Metadata 1", value: "With value" }),
                new Metadata({ name: MetadataInternalKey.tags, value: "some tag3" }),
                new Metadata({ name: "Metadata 2", value: "With value" }),
            ]), tags);
            expect(metadata).toEqual([
                { name: "Metadata 1", value: "With value" },
                { name: "Metadata 2", value: "With value" },
                { name: MetadataInternalKey.tags, value: "tag1,tag2,some tag3" },
            ]);
        });
    });
});

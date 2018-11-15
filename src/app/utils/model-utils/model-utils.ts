import { List } from "immutable";

import { Metadata, MetadataAttributes } from "app/models";
import { MetadataInternalKey } from "common/constants";

export class ModelUtils {
    public static tagsFromMetadata(metadata: List<Metadata>): List<string> {
        const tagsMeta = metadata.filter((x: Metadata) => x.name === MetadataInternalKey.tags).first();
        if (tagsMeta) {
            return List<string>(tagsMeta.value.split(","));
        } else {
            return List([]);
        }
    }

    public static updateMetadataWithTags(metadata: List<Metadata>, tags: List<string>): MetadataAttributes[] {
        const newMetadata = metadata.filter((x: Metadata) => x.name !== MetadataInternalKey.tags).toJS();
        newMetadata.push({ name: MetadataInternalKey.tags, value: tags.join(",") });
        return newMetadata;
    }
}

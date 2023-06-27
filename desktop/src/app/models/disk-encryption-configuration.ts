import { ListProp, Model, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface DiskEncryptionConfigurationAttributes {
    targets: string[];
}

/**
 * Class for displaying Batch disk encryption configuration information.
 */
@Model()
export class DiskEncryptionConfiguration extends Record<DiskEncryptionConfigurationAttributes> {
    @ListProp(String) public targets: List<String>;
}

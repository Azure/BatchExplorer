import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "@batch-flask/core";

export interface CertificateReferenceAttributes {
    thumbprint: string;
    thumbprintAlgorithm: string;
    storeLocation: string;
    storeName: string;
    visibility: string[];
}

/**
 * A reference to an application package to be deployed to a compute nodes
 */
@Model()
export class CertificateReference extends Record<CertificateReferenceAttributes> {
    @Prop() public thumbprint: string;
    @Prop() public thumbprintAlgorithm: string;
    @Prop() public storeLocation: string;
    @Prop() public storeName: string;
    @ListProp(String) public visibility: List<string> = List([]);
}

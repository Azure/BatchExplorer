import { List } from "immutable";

import { ListProp, Model, Prop, Record } from "@batch-flask/core";

export enum CertificateVisibility {
    StartTask = "StartTask",
    Task = "Task",
    RemoteUser = "RemoteUser",
}

export enum CertificateStoreLocation {
    CurrentUser = "CurrentUser",
    LocalMachine = "LocalMachine",
}

export enum CommonStoreName {
    My = "My",
    Root = "Root",
    CA = "CA",
    Trust = "Trust",
    Disallowed = "Disallowed",
    TrustedPeople = "TrustedPeople",
    TrustedPublisher = "TrustedPublisher",
    AuthRoot = "AuthRoot",
    AddressBook = "AddressBook",
}

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
    @Prop() public storeLocation: CertificateStoreLocation;
    @Prop() public storeName: CommonStoreName | string;
    @ListProp(String) public visibility: List<CertificateVisibility> = List([]);
}

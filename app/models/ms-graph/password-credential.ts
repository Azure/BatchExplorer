import { Prop, Record } from "@batch-flask/core";

export interface PasswordCredentialAttributes {
    keyId: string;
    customKeyIdentifier: string; // Base64
    startDate: Date;
    endDate: Date;
    value: string;
}

export class PasswordCredential extends Record<PasswordCredentialAttributes> {
    @Prop() public keyId: string;
    @Prop() public customKeyIdentifier: string;
    @Prop() public startDate: Date;
    @Prop() public endDate: Date;
    @Prop() public value: string;

    public get name() {
        return atob(this.customKeyIdentifier);
    }
}

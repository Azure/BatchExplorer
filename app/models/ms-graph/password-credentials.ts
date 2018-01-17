import { Prop, Record } from "app/core";

export interface PasswordCredentialsAttributes {
    keyId: string;
    customKeyIdentifier: string; // Base64
    startDateTime: Date;
    endDateTime: Date;
    secretText: string;
    hint: string;
}

export class PasswordCredentials extends Record<PasswordCredentialsAttributes> {
    @Prop() public keyId: string;
    @Prop() public customKeyIdentifier: string;
    @Prop() public startDate: Date;
    @Prop() public endDate: Date;
    @Prop() public value: string;

    public get name() {
        return atob(this.customKeyIdentifier);
    }
}

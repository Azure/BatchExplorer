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
    @Prop() public startDateTime: Date;
    @Prop() public endDateTime: Date;
    @Prop() public secretText: string;
    @Prop() public hint: string;

    public get name() {
        return atob(this.customKeyIdentifier);
    }
}

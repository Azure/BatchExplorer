import { Model, Prop, Record } from "@batch-flask/core";

export interface ApplicationLicenseAttributes {
    id: string;
    description: string;
    licenseAgreement: string;
    cost: string;
}

@Model()
export class ApplicationLicense extends Record<ApplicationLicenseAttributes> {
    /**
     * ID of the license (maya|arnold|etc).
     */
    @Prop() public id: string;

    /**
     * Description of the license.
     */
    @Prop() public description: string;

    /**
     * End user license agreement (EULA) for the license.
     */
    @Prop() public licenseAgreement: string;

    /**
     * Cost of the license, this will change to a resource ID.
     */
    @Prop() public cost: string;
}

import { Model, Prop, Record } from "@batch-flask/core";

export interface TenantDetailsAttributes {
    id: string;
    displayName: string;
    tenantId: string;
}

/**
 * Class for tenant details
 */
@Model()
export class TenantDetails extends Record<TenantDetailsAttributes> {
    @Prop() public displayName: string;
    @Prop() public countryCode: string;
    @Prop() public defaultDomain: string;
    @Prop() public domains: string[];
    @Prop() public id: string;
    @Prop() public tenantBrandingLogoUrl: string;
    @Prop() public tenantCategory: string;
    @Prop() public tenantId: string;
    @Prop() public tenantType: string;
}

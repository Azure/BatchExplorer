export interface Tenant {
    id: string;
    tenantId: string;
    countryCode: string;
    displayName: string;
    tenantCategory: string;
    domains: string[];
    defaultDomain: string;
    tenantType: string;
}

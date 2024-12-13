// ported from Portal codebase

export const enum CidrConstants {
    gatewaySubnetMaxCidr = 29,
    gatewaySubnetMaxCidrExpressRouteTypeForUltraPerformanceSku = 27,
    gatewaySubnetMaxCidrExpressRouteType = 28,
    gatewaySubnetMinCidr = 16,
    subnetMaxCidr = 29,
    vnetAddressSpaceMaxCidr = 32,
    localNetworkGatewayIPRangeMaxCidr = 32,
    expressRouteMaxCidr = 30,
    expressRouteMinCidr = 30,
    pointToSiteMinCidr = 1,
    pointToSiteMaxCidr = 32,
    wafMaxIPv4Prefix = 32,
    minPrefix = 0,
    wafMinPrefix = 0,
    maxPrefix = 32,
    minIPv6Prefix = 7,
    wafAppgwMinIPv6Prefix = 1,
    maxIPv6Prefix = 128,
    bastionSubnetMaxCidr = 27,
}

export const enum IpAddresses {
    empty = "0.0.0.0",
}

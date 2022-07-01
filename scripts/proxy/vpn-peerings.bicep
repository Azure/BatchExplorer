targetScope = 'subscription'

param prefix string
param vpnVnetName string
param vpnVnetResourceGroup string
param vnetName string
param vnetResourceGroup string

resource vnet 'Microsoft.Network/virtualNetworks@2021-08-01' existing = {
  scope: resourceGroup(vnetResourceGroup)
  name: vnetName
}

resource vpnVnet 'Microsoft.Network/virtualNetworks@2021-08-01' existing = {
  scope: resourceGroup(vpnVnetResourceGroup)
  name: vpnVnetName
}

module proxyPeering './peering.bicep' = {
  name: 'proxy2vpn-module'
  scope: resourceGroup(vnetResourceGroup)
  params: {
    name: '${prefix}-proxy2vpn'
    vnetName: vnetName
    remoteVnetId: vpnVnet.id
    allowGatewayTransit: false
    useRemoteGateways: true
  }
}

module vpnPeering './peering.bicep' = {
  name: 'vpn2proxy-module'
  scope: resourceGroup(vpnVnetResourceGroup)
  params: {
    name: '${prefix}-vpn2proxy'
    vnetName: vpnVnetName
    remoteVnetId: vnet.id
    allowGatewayTransit: true
    useRemoteGateways: false
  }
}

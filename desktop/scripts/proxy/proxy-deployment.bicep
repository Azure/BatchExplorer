targetScope = 'resourceGroup'

param prefix string
param location string
param vmSize string
param proxyPort string
param username string
param password string
param proxyVmSize string
param proxyPublicKey string
param batchExplorerBuild string

param internalIpAddressRange string = '10.0.0.0/16'
param defaultSubnetAddressPrefix string = '10.0.100.0/24'
param proxySubnetAddressPrefix string = '10.0.101.0/24'
param vnetAddressPrefixes array = [
  internalIpAddressRange
]

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2021-08-01' = {
  name: '${prefix}-vnet'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: vnetAddressPrefixes
    }
  }
}

resource restrictedSubnet 'Microsoft.Network/virtualNetworks/subnets@2021-08-01' = {
  name: 'default'
  parent: virtualNetwork
  properties: {
    addressPrefix: defaultSubnetAddressPrefix
  }
}

resource proxySubnet 'Microsoft.Network/virtualNetworks/subnets@2021-08-01' = {
  name: 'proxy'
  parent: virtualNetwork
  properties: {
    addressPrefix: proxySubnetAddressPrefix
  }
}

resource proxyNsg 'Microsoft.Network/networkSecurityGroups@2021-08-01' = {
  name: '${prefix}-open-nsg'
  location: location
  properties: {
    securityRules: [
      {
        name: 'SSH-RDP'
        properties: {
          description: 'Allow SSH & RDP into host'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRanges: [
            '22'
            '3389'
          ]
          sourceAddressPrefix: internalIpAddressRange
          destinationAddressPrefix: '*'
          access: 'Allow'
          priority: 100
          direction: 'Inbound'
        }
      }
      {
        name: 'AllowHTTPAndHTTPSOutbound'
        properties: {
          description: 'Allow HTTP/S from host'
          protocol: 'Tcp'
          sourcePortRanges: [
            '80'
            '443'
          ]
          destinationPortRanges: [
            '80'
            '443'
          ]
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
          access: 'Allow'
          priority: 101
          direction: 'Outbound'
        }
      }
    ]
  }
}

resource restrictedNsg 'Microsoft.Network/networkSecurityGroups@2021-08-01' = {
  name: '${prefix}-restricted-nsg'
  location: location
  properties: {
    securityRules: [
      {
        name: 'AllowSSHAndRDP'
        properties: {
          description: 'Allow SSH & RDP into host'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRanges: [
            '22'
            '3389'
          ]
          sourceAddressPrefix: internalIpAddressRange
          destinationAddressPrefix: '*'
          access: 'Allow'
          priority: 100
          direction: 'Inbound'
        }
      }
      {
        name: 'AllowProxy'
        properties: {
          description: 'Allow access to proxy server'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: proxyPort
          sourceAddressPrefix: '*'
          destinationAddressPrefix: proxyServerIp
          access: 'Allow'
          priority: 101
          direction: 'Outbound'
        }
      }
    ]
  }
}

module proxyServer './proxy-server.bicep' = {
  name: 'proxy-server-module'
  params: {
    prefix: prefix
    location: location
    subnetId: proxySubnet.id
    nsgId: proxyNsg.id
    username: username
    vmSize: proxyVmSize
    publicKey: proxyPublicKey
    proxyPort: proxyPort
  }
}

var proxyServerIp = proxyServer.outputs.ipAddress

module virtualMachine './virtual-machine.bicep' = {
  name: 'vm-module'
  params: {
    prefix: prefix
    location: location
    subnetId: restrictedSubnet.id
    nsgId: restrictedNsg.id
    vmSize: vmSize
    username: username
    password: password
    proxyServer: proxyServerIp
    proxyPort: proxyPort
    batchExplorerBuild: batchExplorerBuild
  }
}

resource denyNonProxyRule 'Microsoft.Network/networkSecurityGroups/securityRules@2021-08-01' = {
  name: 'DenyNonProxyOutbound'
  parent: restrictedNsg
  dependsOn: [
    virtualMachine
  ]
  properties: {
    description: 'Deny outbound access to all traffic'
    protocol: 'Tcp'
    sourcePortRange: '*'
    destinationPortRange: '*'
    sourceAddressPrefix: '*'
    destinationAddressPrefix: '*'
    access: 'Deny' // Should be updated to `Deny` after deployment
    priority: 102
    direction: 'Outbound'
  }
}

output vnetName string = virtualNetwork.name
output virtualMachineId string = virtualMachine.outputs.id
output virtualMachineIpAddress string = virtualMachine.outputs.ipAddress
output proxyServerIpAddress string = proxyServer.outputs.ipAddress

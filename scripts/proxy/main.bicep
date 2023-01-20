targetScope = 'subscription'

@description('The resource group')
param resourceGroupName string

@description('Whether or not to create the resource group')
param createResourceGroup bool = true

@maxLength(7)
@description('The prefix for deployment resources')
param prefix string = resourceGroupName

@description('The location of the deployment')
param location string = deployment().location

@description('VM Size')
param vmSize string = 'Standard_D2s_v3'

@description('Proxy port')
param proxyPort string = '3128'

@description('VM Username')
param username string

@description('VM Password')
@secure()
param password string

@description('VM size for proxy server')
param proxyVmSize string = vmSize

@description('Public key data for proxy server')
param proxyPublicKey string = ''

@description('A virtual network with a VPN gateway')
param vpnVnetName string

@description('A virtual network with a VPN gateway')
param vpnVnetResourceGroup string = 'user-whitelisted-rg'

@description('The Batch Explorer build to fetch (e.g., "2.14.0-insider.602")')
param batchExplorerBuild string

resource deploymentRG 'Microsoft.Resources/resourceGroups@2021-04-01' = if (createResourceGroup) {
  name: resourceGroupName
  location: location
}

module proxyDeployment './proxy-deployment.bicep' = {
  name: 'proxy-deployment-module'
  scope: deploymentRG
  params: {
    prefix: prefix
    location: location
    vmSize: vmSize
    proxyPort: proxyPort
    username: username
    password: password
    proxyVmSize: proxyVmSize
    proxyPublicKey: proxyPublicKey
    batchExplorerBuild: batchExplorerBuild
  }
}

module peerings './vpn-peerings.bicep' = {
  name: 'peerings-module'
  params: {
    prefix: prefix
    vnetName: proxyDeployment.outputs.vnetName
    vnetResourceGroup: resourceGroupName
    vpnVnetName: vpnVnetName
    vpnVnetResourceGroup: vpnVnetResourceGroup
  }
}

output virtualMachineIp string = proxyDeployment.outputs.virtualMachineIpAddress
output proxyServerIp string = proxyDeployment.outputs.proxyServerIpAddress

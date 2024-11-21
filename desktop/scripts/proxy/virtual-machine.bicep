targetScope = 'resourceGroup'

param prefix string
param location string
param subnetId string
param nsgId string
param username string
param vmSize string
param password string
param proxyServer string
param proxyPort string
param batchExplorerBuild string

resource vmNic 'Microsoft.Network/networkInterfaces@2021-08-01' = {
  name: '${prefix}-vmnic'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAddress: '192.168.0.4'
          privateIPAllocationMethod: 'Dynamic'
          primary: true
          privateIPAddressVersion: 'IPv4'
          subnet: {
            id: subnetId
          }
        }
      }
    ]
    networkSecurityGroup: {
      id: nsgId
    }
    enableAcceleratedNetworking: true
    enableIPForwarding: false
  }
}

resource virtualMachine 'Microsoft.Compute/virtualMachines@2021-11-01' = {
  name: '${prefix}-vm'
  location: location
  properties: {
    networkProfile: {
      networkInterfaces: [
        {
          id: vmNic.id
        }
      ]
    }
    osProfile: {
      computerName: '${prefix}-vm'
      adminUsername: username
      adminPassword: password
    }
    storageProfile: {
      imageReference: {
        publisher: 'MicrosoftWindowsDesktop'
        offer: 'Windows-10'
        sku: 'win10-21h2-pro-g2'
        version: 'latest'
      }
      osDisk: {
        osType: 'Windows'
        name: '${prefix}-vmdisk'
        createOption: 'FromImage'
        caching: 'ReadWrite'
        diskSizeGB: 127
      }
    }
    hardwareProfile: {
      vmSize: vmSize
    }
    licenseType: 'Windows_Client'
  }
}

resource windowsVMExtensions 'Microsoft.Compute/virtualMachines/extensions@2020-12-01' = {
  parent: virtualMachine
  name: '${prefix}-vmext'
  location: location
  properties: {
    publisher: 'Microsoft.Compute'
    type: 'CustomScriptExtension'
    typeHandlerVersion: '1.10'
    autoUpgradeMinorVersion: true
    protectedSettings: {
      fileUris: [
        'https://raw.githubusercontent.com/Azure/BatchExplorer/main/scripts/proxy/initVirtualMachine.ps1'
      ]
      commandToExecute: 'pwsh -ExecutionPolicy Bypass -File initVirtualMachine.ps1 -Address ${proxyServer} -Port ${proxyPort} -Build ${batchExplorerBuild}'
    }
  }
}

output id string = virtualMachine.id
output ipAddress string = vmNic.properties.ipConfigurations[0].properties.privateIPAddress

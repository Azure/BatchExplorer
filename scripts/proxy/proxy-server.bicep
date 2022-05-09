targetScope = 'resourceGroup'

param prefix string
param location string
param subnetId string
param nsgId string
param username string
param vmSize string
param publicKey string = ''
param proxyPort string

/* The proxy server allows the virtual machine to connect to the rest of the
 * internet.
 */
resource proxyNic 'Microsoft.Network/networkInterfaces@2021-08-01' = {
  name: '${prefix}-proxynic'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAddress: '192.168.0.5'
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

resource proxyServer 'Microsoft.Compute/virtualMachines@2021-11-01' = {
  name: '${prefix}-proxyserver'
  location: location
  properties: {
    storageProfile: {
      osDisk: {
        createOption: 'FromImage'
        managedDisk: {
          storageAccountType: 'Premium_LRS'
        }
      }
      imageReference: {
        publisher: 'canonical'
        offer: '0001-com-ubuntu-server-focal'
        sku: '20_04-lts-gen2'
        version: 'latest'
      }
    }
    hardwareProfile: {
      vmSize: vmSize
    }
    osProfile: {
      computerName: 'proxy'
      adminUsername: username
      linuxConfiguration: {
        disablePasswordAuthentication: true
        ssh: (empty(publicKey) ? null : {
          publicKeys: [
            {
              path: '/home/${username}/.ssh/authorized_keys'
              keyData: publicKey
            }
          ]
        })
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: proxyNic.id
        }
      ]
    }
  }
}

resource proxyServerExtensions 'Microsoft.Compute/virtualMachines/extensions@2019-07-01' = {
  parent: proxyServer
  name: '${prefix}-proxyvmext'
  location: location
  properties: {
    publisher: 'Microsoft.Azure.Extensions'
    type: 'CustomScript'
    typeHandlerVersion: '2.1'
    autoUpgradeMinorVersion: true
    protectedSettings: {
      commandToExecute: 'sh initProxyServer.sh ${proxyPort}'
      fileUris: [
        'https://raw.githubusercontent.com/Azure/BatchExplorer/master/scripts/proxy/initProxyServer.sh'
      ]
    }
  }
}

output ipAddress string = proxyNic.properties.ipConfigurations[0].properties.privateIPAddress

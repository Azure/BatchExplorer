# Deploying Batch Explorer Within a Proxied Environment

In order to test how Batch Explorer behaves within a locked-down environment, it's useful to deploy Batch Explorer within a restricted environment in Azure. In this deployment, Batch Explorer is installed within a Windows VM whose connectivity is highly restricted. The VM can receive inbound SSH and RDP connections over private IP, so you can only reach the VM over a VPN connection. The VM can make outbound connetions with the outside world only through a proxy server, which is created using [Squid](http://www.squid-cache.org/) hosted on a Linux Ubuntu VM.

A template is provided that can create the entire environment with Batch Explorer installed. It also creates peerings from your VPN gateway to the deployment's new virtual network.

## Prerequisites

* A valid Azure subscription
* The [`az`](https://docs.microsoft.com/cli/azure/) command-line interface
* [jq](https://stedolan.github.io/jq/)
* An existing virtual network with a VPN gateway that will allow you to connect to the restricted VM
* An existing SSH keypair

## Steps

### 1. Create a deployment param file

Create a `params.json` file that is specific to your subscription

```json
{
    "parameters": {
        "resourceGroupName": { "value": "" },
        "createResourceGroup": { "value": true },
        "prefix": { "value": "" },
        "username": { "value": "" },
        "password": { "value": "" },
        "vpnVnetName": { "value": "" },
        "vpnVnetResourceGroup": { "value": "" },
        "batchExplorerBuild": { "value": "" },
        "proxyPort": { "value": "" },
        "proxyPublicKey": { "value": "" }
    }
}
```

The parameters are:

* `resourceGroupName`: A resource group to contain all the resources in the deployment. The resource group will be created.
* `createResourceGroup`: Should the resource group be created? Otherwise, the deployment assumes the resource group exists with no conflicting resources.
* `prefix`: A prefix to identify all deployed resources (e.g., "beproxy"). Cannot be longer than 7 characters to avoid resource name length limits (e.g., Windows VMs).
* `username`: The username for logging into the restricted VM.
* `password`: The password for logging into the restricted VM.
* `vpnVnetName`: The virtual network with the preexisting VPN gateway.
* `vpnVnetResourceGroup`: The resource group of the VPN virtual network.
* `batchExplorerBuild`: The string identifying which Batch Explorer build to fetch (e.g., "2.14.0-insider.602"). The corresponding build must be available to download from the public site, and can be either an insider or stable release.
* `proxyPort`: The port with which the VM communicates with the proxy server. Used both to set up the the proxy server and the connection to it from the restricted VM (default: 3128).
* `proxyPublicKey`: The public key of the SSH key pair in order to access the proxy server over SSH. (_optional_)

### 2. Create the deployment

Run the following shell command, supplying the JSON parameter file and a target Azure location for the deployment

```azurecli
 az deployment sub create \
    -f ./scripts/proxy/main.bicep \
    --parameters @params.json \
    --location ${location}
```

## Connecting to the restricted and proxy VMs

When the VPN is active, both the restricted Windows VM and the proxy Linux VM can be accessed using their private IP addresses. The restricted VM can be reached with RDP using the above username and password. Download an RDP configuration file by navigating to the VM on the Azure Portal (will be called `${prefix}-vm`) and then pressing on Connect > RDP > Download RDP File. To connect to the proxy server, SSH into it using the username and SSH key supplied above, or use Bastion from the VM's Connect command on the Azure Portal.

## Notes

* On the restricted VM, the setup script is installed in the directory `C:\Packages\Plugins\Microsoft.Compute.CustomScriptExtension\1.10.12\Downloads\0`

* Failed deployments might be salvaged by passing `--confirm-with-what-if` to `az deployment`, which will prompt you to skip existing resources.

* Creating the VPN peering may fail if an existing peering already uses the same address space. Remove the existing peering and redeploy with `--confirm-with-what-if`. Alternatively, run the peering module directly using

    ```azurecli
    az deployment sub create \
        -f ./scripts/proxy/vpn-peerings.bicep \
        --location ${location}
    ```

    The parameters for the peering module are `prefix`, `vpnVnetName`, `vpnVnetResourceGroup`, `vnetName`, and `vnetResourceGroup`. The first three are the same params as the main deployment. `vnetName` is `${prefix}-vnet` and `vnetResourceGroup` is the `resourceGroupName`.

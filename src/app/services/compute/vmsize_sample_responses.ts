export const cloudServiceResponse = {
    "value": [
        {
            "resourceType": "virtualMachines",
            "locations": [
                "westus"
            ],
            "capabilities": [
                {
                    "name": "MaxResourceVolumeMB",
                    "value": "20480"
                },
                {
                    "name": "OSVhdSizeMB",
                    "value": "1047552"
                },
                {
                    "name": "vCPUs",
                    "value": "1"
                },
                {
                    "name": "MemoryGB",
                    "value": "0.75"
                },
                {
                    "name": "MaxDataDiskCount",
                    "value": "1"
                },
                {
                    "name": "GPUs",
                    "value": "0"
                }
            ],
            "locationInfo": [
                {
                    "location": "westus",
                    "zones": [
                        "1",
                    ]
                }
            ],
            "name": "small",
            "tier": "Standard",
            "size": "small",
            "family": "standardSmallFamily"
        },
        {
            "resourceType": "virtualMachines",
            "locations": [
                "westus"
            ],
            "capabilities": [
                {
                    "name": "MaxResourceVolumeMB",
                    "value": "51200"
                },
                {
                    "name": "OSVhdSizeMB",
                    "value": "1047552"
                },
                {
                    "name": "vCPUs",
                    "value": "1"
                },
                {
                    "name": "MemoryGB",
                    "value": "3.5"
                },
                {
                    "name": "MaxDataDiskCount",
                    "value": "4"
                },
                {
                    "name": "GPUs",
                    "value": "2"
                }
            ],
            "locationInfo": [
                {
                    "location": "eastus",
                    "zones": [
                        "1",
                    ],
                    "zoneDetails": []
                }
            ],
            "name": "Standard_D1",
            "tier": "Standard",
            "size": "D1",
            "family": "standardDFamily"
        }
    ]
}

export const virtualMachineResponse = {
    "value": [
        {
            "resourceType": "virtualMachines",
            "locations": [
                "westus"
            ],
            "capabilities": [
                {
                    "name": "MaxResourceVolumeMB",
                    "value": "71680"
                },
                {
                    "name": "OSVhdSizeMB",
                    "value": "1047552"
                },
                {
                    "name": "vCPUs",
                    "value": "1"
                },
                {
                    "name": "MemoryGB",
                    "value": "1.75"
                },
                {
                    "name": "MaxDataDiskCount",
                    "value": "2"
                },
                {
                    "name": "GPUs",
                    "value": "0"
                }
            ],
            "locationInfo": [
                {
                    "location": "westus",
                    "zones": [
                        "1",
                        "2",
                        "3"
                    ]
                }
            ],
            "name": "Standard_A1",
            "tier": "Standard",
            "size": "A1",
            "family": "standardA0_A7Family"
        },
        {
            "resourceType": "virtualMachines",
            "locations": [
                "westus"
            ],
            "capabilities": [
                {
                    "name": "MaxResourceVolumeMB",
                    "value": "51200"
                },
                {
                    "name": "OSVhdSizeMB",
                    "value": "1047552"
                },
                {
                    "name": "vCPUs",
                    "value": "1"
                },
                {
                    "name": "MemoryGB",
                    "value": "3.5"
                },
                {
                    "name": "MaxDataDiskCount",
                    "value": "4"
                },
                {
                    "name": "GPUs",
                    "value": "2"
                }
            ],
            "locationInfo": [
                {
                    "location": "eastus",
                    "zones": [
                        "1",
                    ],
                    "zoneDetails": []
                }
            ],
            "name": "Standard_D1",
            "tier": "Standard",
            "size": "D1",
            "family": "standardDFamily"
        }
    ]
}

export const badResponseIsNaN = {
    "value": [
        {
            "resourceType": "virtualMachines",
            "locations": [
                "westus"
            ],
            "capabilities": [
                {
                    "name": "MaxResourceVolumeMB",
                    "value": "20480"
                },
                {
                    "name": "OSVhdSizeMB",
                    "value": "1047552"
                },
                {
                    "name": "vCPUs",
                    "value": "invalidValue"
                },
                {
                    "name": "MemoryGB",
                    "value": "0.75"
                },
                {
                    "name": "MaxDataDiskCount",
                    "value": "1"
                },
                {
                    "name": "GPUs",
                    "value": "0"
                },
            ],
            "locationInfo": [
                {
                    "location": "westus",
                    "zones": [
                        "2",
                        "1"
                    ],
                    "zoneDetails": [
                        {
                            "name": [
                                "2"
                            ],
                            "capabilities": [
                                {
                                    "name": "UltraSSDAvailable",
                                    "value": "True"
                                }
                            ]
                        }
                    ]
                }
            ],
            "name": "Standard_A0",
            "tier": "Standard",
            "size": "A0",
            "family": "standardA0_A7Family"
        }
    ],
    "nextLink": null
}

export const responseWithExtraCapability = {
    "value": [
        {
            "resourceType": "virtualMachines",
            "locations": [
                "westus"
            ],
            "capabilities": [
                {
                    "name": "MaxResourceVolumeMB",
                    "value": "20480"
                },
                {
                    "name": "OSVhdSizeMB",
                    "value": "1047552"
                },
                {
                    "name": "vCPUs",
                    "value": "1"
                },
                {
                    // unit test should skip this capability
                    "name": "HyperVGenerations",
                    "value": "V1"
                },
                {
                    "name": "MemoryGB",
                    "value": "0.75"
                },
                {
                    "name": "MaxDataDiskCount",
                    "value": "1"
                },
                {
                    "name": "GPUs",
                    "value": "0"
                },
            ],
            "locationInfo": [
                {
                    "location": "westus",
                    "zones": [
                        "2",
                        "1"
                    ],
                    "zoneDetails": [
                        {
                            "name": [
                                "2"
                            ],
                            "capabilities": [
                                {
                                    "name": "UltraSSDAvailable",
                                    "value": "True"
                                }
                            ]
                        }
                    ]
                }
            ],
            "name": "Standard_A0",
            "tier": "Standard",
            "size": "A0",
            "family": "standardA0_A7Family"
        }
    ],
    "nextLink": null
}

import { Pool } from "app/models";
import { PoolUtils } from "app/utils";

describe("PoolUtils", () => {
    describe("#getOsName()", () => {
        it("check os friendly name mappings", () => {
            const cs2Pool = new Pool({
                cloudServiceConfiguration: {
                    currentOSVersion: "*",
                    osFamily: 2,
                },
            });

            const cs3Pool = new Pool({
                cloudServiceConfiguration: {
                    currentOSVersion: "*",
                    osFamily: 3,
                },
            });

            const cs4Pool = new Pool({
                cloudServiceConfiguration: {
                    currentOSVersion: "*",
                    osFamily: 4,
                },
            });

            const cs5Pool = new Pool({
                cloudServiceConfiguration: {
                    currentOSVersion: "*",
                    osFamily: 5,
                },
            });

            const vm1Pool = new Pool({
                virtualMachineConfiguration: {
                    imageReference: {
                        publisher: "Canonical",
                        offer: "UbuntuServer",
                        sku: "16.04-LTS",
                        version: "latest",
                    },
                    nodeAgentSKUId: "batch.node.ubuntu 16.04",
                },
            });

            const vm2Pool = new Pool({
                virtualMachineConfiguration: {
                    imageReference: {
                        publisher: "MicrosoftWindowsServer",
                        offer: "WindowsServer",
                        sku: "2012-R2-Datacenter",
                        version: "latest",
                    },
                    nodeAgentSKUId: "batch.node.windows amd64",
                },
            });

            expect(PoolUtils.getOsName(cs2Pool)).toBe("Windows Server 2008 R2 SP1");
            expect(PoolUtils.getOsName(cs3Pool)).toBe("Windows Server 2012");
            expect(PoolUtils.getOsName(cs4Pool)).toBe("Windows Server 2012 R2");
            expect(PoolUtils.getOsName(cs5Pool)).toBe("Windows Server 2016");
            expect(PoolUtils.getOsName(vm1Pool)).toBe("UbuntuServer 16.04-LTS");
            expect(PoolUtils.getOsName(vm2Pool)).toBe("Windows Server 2012-R2-Datacenter");
        });
    });

    describe("#getComputePoolOsIcon()", () => {
        it("check icon selection based on pool name", () => {
            const cs2Pool = new Pool({
                cloudServiceConfiguration: {
                    currentOSVersion: "*",
                    osFamily: 2,
                },
            });

            const cs3Pool = new Pool({
                cloudServiceConfiguration: {
                    currentOSVersion: "*",
                    osFamily: 3,
                },
            });

            const cs4Pool = new Pool({
                cloudServiceConfiguration: {
                    currentOSVersion: "*",
                    osFamily: 4,
                },
            });

            const cs5Pool = new Pool({
                cloudServiceConfiguration: {
                    currentOSVersion: "*",
                    osFamily: 5,
                },
            });

            const vm1Pool = new Pool({
                virtualMachineConfiguration: {
                    imageReference: {
                        publisher: "Canonical",
                        offer: "UbuntuServer",
                        sku: "16.04-LTS",
                        version: "latest",
                    },
                    nodeAgentSKUId: "batch.node.ubuntu 16.04",
                },
            });

            const vm2Pool = new Pool({
                virtualMachineConfiguration: {
                    imageReference: {
                        publisher: "MicrosoftWindowsServer",
                        offer: "WindowsServer",
                        sku: "2012-R2-Datacenter",
                        version: "latest",
                    },
                    nodeAgentSKUId: "batch.node.windows amd64",
                },
            });

            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsName(cs2Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsName(cs3Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsName(cs4Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsName(cs5Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsName(vm1Pool))).toBe("linux");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsName(vm2Pool))).toBe("windows");
        });
    });
});

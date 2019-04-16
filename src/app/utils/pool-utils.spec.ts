import { CloudServiceOsFamily, Pool, VmSize } from "app/models";
import { SoftwarePricing } from "app/services/pricing";
import { PoolUtils } from "app/utils";

describe("PoolUtils", () => {
    describe("#getOsName()", () => {
        it("check os friendly name mappings", () => {
            const cs2Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2008R2,
                },
            });

            const cs3Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2012,
                },
            });

            const cs4Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2012R2,
                },
            });

            const cs5Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2016,
                },
            });

            const cs6Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2019,
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
            expect(PoolUtils.getOsName(cs6Pool)).toBe("Windows Server 2019");
            expect(PoolUtils.getOsName(vm1Pool)).toBe("UbuntuServer 16.04-LTS");
            expect(PoolUtils.getOsName(vm2Pool)).toBe("Windows Server 2012-R2-Datacenter");
        });
    });

    describe("#getComputePoolOsIcon()", () => {
        it("check icon selection based on pool name", () => {
            const cs2Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2008R2,
                },
            });

            const cs3Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2012,
                },
            });

            const cs4Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2012R2,
                },
            });

            const cs5Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2016,
                },
            });

            const cs6Pool = new Pool({
                cloudServiceConfiguration: {
                    osFamily: CloudServiceOsFamily.windowsServer2019,
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

            const vm3Pool = new Pool({
                virtualMachineConfiguration: {
                    imageReference: {
                        publisher: "batch",
                        offer: "rendering-windows2016",
                        sku: "rendering",
                        version: "latest",
                    },
                    nodeAgentSKUId: "batch.node.windows amd64",
                },
            });

            const vm4Pool = new Pool({
                virtualMachineConfiguration: {
                    imageReference: {
                        publisher: "batch",
                        offer: "autodesk-maya-arnold-centos73",
                        sku: "maya-arnold-2017",
                        version: "latest",
                    },
                    nodeAgentSKUId: "batch.node.centos 7",
                },
            });

            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsType(cs2Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsType(cs3Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsType(cs4Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsType(cs5Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsType(cs6Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsType(vm1Pool))).toBe("linux");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsType(vm2Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsType(vm3Pool))).toBe("windows");
            expect(PoolUtils.getComputePoolOsIcon(PoolUtils.getOsType(vm4Pool))).toBe("linux");
        });
    });

    it("#poolNodesStatus()", () => {
        const status1 = PoolUtils.poolNodesStatus(new Pool({ allocationState: "resizing" }), 1, 4);
        expect(status1).toEqual("1 → 4");

        const status2 = PoolUtils.poolNodesStatus(new Pool({ allocationState: "steady" }), 4, 0);
        expect(status2).toEqual("4");

        const status3 = PoolUtils.poolNodesStatus(new Pool({ allocationState: "steady", resizeErrors: [{}] }), 1, 10);
        expect(status3).toEqual("1 → 10");
    });

    describe("#computePoolPrice()", () => {
        const cost = {
            regular: 12,
            lowpri: 4.8,
        };

        const vmSize = new VmSize({
            numberOfCores: 3,
        } as any);

        const softwares = new SoftwarePricing();
        softwares.add("vray", 0.02, true);
        softwares.add("3dsmax", 0.65, false);
        softwares.add("maya", 0.75, false);

        it("works for a basic pool", () => {
            const windowsConfig = {
                imageReference: { publisher: "Microsoft", offer: "windows", sku: "2016", version: "*" },
                nodeAgentSKUId: "agent.windows",
            };

            const pool = new Pool({
                virtualMachineConfiguration: windowsConfig,
                currentDedicatedNodes: 2,
                currentLowPriorityNodes: 10,
            });
            const poolCost = PoolUtils.computePoolPrice(pool, vmSize, cost, softwares);
            expect(poolCost).toEqual({
                dedicated: 24,
                lowPri: 120 * 0.4, // AT a 60% discount
                total: 24 + 120 * 0.4,
                unit: "USD",
            });
        });

        it("works for a pool with application licenses", () => {
            const windowsConfig = {
                imageReference: { publisher: "Microsoft", offer: "windows", sku: "2016", version: "*" },
                nodeAgentSKUId: "agent.windows",
            };

            const pool = new Pool({
                virtualMachineConfiguration: windowsConfig,
                currentDedicatedNodes: 2,
                currentLowPriorityNodes: 10,
                applicationLicenses: ["vray", "3dsmax"],
            });
            const poolCost = PoolUtils.computePoolPrice(pool, vmSize, cost, softwares);
            const licenseExtraPerNode = 0.65 + 3 * 0.02;
            const dedicated = 2 * (12 + licenseExtraPerNode);
            const lowPri = 10 * (4.8 + licenseExtraPerNode);
            expect(poolCost.dedicated).toBeCloseTo(dedicated, 10);
            expect(poolCost.lowPri).toBeCloseTo(lowPri, 10);
            expect(poolCost.total).toBeCloseTo(dedicated + lowPri, 10);
            expect(poolCost.unit).toBe("USD");
        });
    });

    it("#hasGPU()", () => {
        expect(PoolUtils.hasGPU(new Pool({ vmSize: "standard_a1" }))).toBe(false);
        expect(PoolUtils.hasGPU(new Pool({ vmSize: "Standard_A2" }))).toBe(false);
        expect(PoolUtils.hasGPU(new Pool({ vmSize: "Standard_d3_v2" }))).toBe(false);

        expect(PoolUtils.hasGPU(new Pool({ vmSize: "Standard_N1" }))).toBe(true);
        expect(PoolUtils.hasGPU(new Pool({ vmSize: "Standard_nc1" }))).toBe(true);
        expect(PoolUtils.hasGPU(new Pool({ vmSize: "standard_nc1_V2" }))).toBe(true);
    });
});

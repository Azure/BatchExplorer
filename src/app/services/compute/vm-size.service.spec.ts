import { ArmBatchAccount, ArmSubscription, LocalBatchAccount } from "app/models";
import { BehaviorSubject, of } from "rxjs";
import { take } from "rxjs/operators";
import { VmSizeService } from "./vm-size.service";

const sub1 = new ArmSubscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

const vmSizesResponse = {
    value: [
        {
            name: "Standard_A0",
            numberOfCores: 1,
            osDiskSizeInMB: 1047552,
            resourceDiskSizeInMB: 20480,
            memoryInMB: 768,
            maxDataDiskCount: 1,
        },
        {
            name: "Standard_A1",
            numberOfCores: 1,
            osDiskSizeInMB: 1047552,
            resourceDiskSizeInMB: 71680,
            memoryInMB: 1792,
            maxDataDiskCount: 2,
        },
        {
            name: "small",
            numberOfCores: 1,
            osDiskSizeInMB: 1047552,
            resourceDiskSizeInMB: 20480,
            memoryInMB: 768,
            maxDataDiskCount: 1,
        },
        {
            name: "Standard_D1",
            numberOfCores: 1,
            osDiskSizeInMB: 1047552,
            resourceDiskSizeInMB: 51200,
            memoryInMB: 3584,
            maxDataDiskCount: 4,
        },
    ],
};

const githubDataResponse = {
    category: {
        all: [".*"],
        memory: [
            "^standard_d[0-9a-z]*$",
        ],
    },
    all: [
        "^standard_d[0-9]*$",
    ],
    paas: [
        "small",
        "medium",
        "large",
        "extralarge",
    ],
    iaas: [
        "^standard_a[1-9][0-9]*$",
    ],
};

describe("VMSizeService", () => {
    let service: VmSizeService;
    let armSpy;
    let githubDataSpy;
    let accountServiceSpy;

    beforeEach(() => {
        armSpy = {
            get: jasmine.createSpy("arm.get").and.returnValue(of(vmSizesResponse)),
        };

        githubDataSpy = {
            get: jasmine.createSpy("githubData.get").and.returnValue(of(JSON.stringify(githubDataResponse))),
        };

        accountServiceSpy = {
            currentAccount: new BehaviorSubject(new ArmBatchAccount({
                id: "/subs/sub-1/batchaccounts/acc-1",
                name: "acc-1",
                location: "westus",
                properties: {} as any,
                subscription: sub1,
            })),
        };
        service = new VmSizeService(armSpy, githubDataSpy, accountServiceSpy);
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it("use the batch account subscription and location for the sizes", async () => {
        await service.sizes.pipe(take(1)).toPromise();
        expect(armSpy.get).toHaveBeenCalledOnce();
        expect(armSpy.get).toHaveBeenCalledWith(
            "subscriptions/sub1/providers/Microsoft.Compute/locations/westus/vmSizes");
    });

    it("only calls the vm sizes api once per account", async () => {
        await service.sizes.pipe(take(1)).toPromise();
        expect(armSpy.get).toHaveBeenCalledOnce();
        await service.sizes.pipe(take(1)).toPromise();
        expect(armSpy.get).toHaveBeenCalledOnce();
    });

    it("calls again when batch account changes", async () => {
        const sizeSub = service.sizes.subscribe();
        expect(armSpy.get).toHaveBeenCalledTimes(1);

        accountServiceSpy.currentAccount.next(new ArmBatchAccount({
            id: "/subs/sub-1/batchaccounts/acc-2",
            name: "acc-2",
            location: "brazilsouth",
            properties: {} as any,
            subscription: sub1,
        }));

        expect(armSpy.get).toHaveBeenCalledTimes(2);
        expect(armSpy.get).toHaveBeenCalledWith(
            "subscriptions/sub1/providers/Microsoft.Compute/locations/brazilsouth/vmSizes");
        sizeSub.unsubscribe();
    });

    it("gets the sizes", async () => {
        const sizes = await service.sizes.pipe(take(1)).toPromise();
        expect(sizes).not.toBeFalsy();

        expect(sizes!.toJS()).toEqual([
            {
                id: "standard_a0",
                name: "Standard_A0",
                numberOfCores: 1,
                osDiskSizeInMB: 1047552,
                resourceDiskSizeInMB: 20480,
                memoryInMB: 768,
                maxDataDiskCount: 1,
            },
            {
                id: "standard_a1",
                name: "Standard_A1",
                numberOfCores: 1,
                osDiskSizeInMB: 1047552,
                resourceDiskSizeInMB: 71680,
                memoryInMB: 1792,
                maxDataDiskCount: 2,
            },
            {
                id: "small",
                name: "small",
                numberOfCores: 1,
                osDiskSizeInMB: 1047552,
                resourceDiskSizeInMB: 20480,
                memoryInMB: 768,
                maxDataDiskCount: 1,
            },
            {
                id: "standard_d1",
                name: "Standard_D1",
                numberOfCores: 1,
                osDiskSizeInMB: 1047552,
                resourceDiskSizeInMB: 51200,
                memoryInMB: 3584,
                maxDataDiskCount: 4,
            },
        ]);
    });

    it("fitlers the IAAS sizes", async () => {
        const sizes = await service.virtualMachineSizes.pipe(take(1)).toPromise();
        expect(sizes).not.toBeFalsy();
        expect(sizes!.toJS().map(x => x.id)).toEqual([
            "standard_a1",
            "standard_d1",
        ]);
    });

    it("fitlers the Cloud Service sizes", async () => {
        const sizes = await service.cloudServiceSizes.pipe(take(1)).toPromise();
        expect(sizes).not.toBeFalsy();
        expect(sizes!.toJS().map(x => x.id)).toEqual([
            "small",
            "standard_d1",
        ]);
    });

    it("returns null for the sizes when using local batch account", async () => {
        accountServiceSpy.currentAccount.next(new LocalBatchAccount({}));
        const sizes = await service.sizes.pipe(take(1)).toPromise();
        expect(sizes).toBeFalsy();
    });

    it("get a size by id", async () => {
        const size1 = await service.get("standard_a1").toPromise();
        expect(size1.toJS()).toEqual({
            id: "standard_a1",
            name: "Standard_A1",
            numberOfCores: 1,
            osDiskSizeInMB: 1047552,
            resourceDiskSizeInMB: 71680,
            memoryInMB: 1792,
            maxDataDiskCount: 2,
        });

        const size2 = await service.get("StanDard_D1").toPromise();
        expect(size2.toJS()).toEqual({
            id: "standard_d1",
            name: "Standard_D1",
            numberOfCores: 1,
            osDiskSizeInMB: 1047552,
            resourceDiskSizeInMB: 51200,
            memoryInMB: 3584,
            maxDataDiskCount: 4,
        });
    });
});

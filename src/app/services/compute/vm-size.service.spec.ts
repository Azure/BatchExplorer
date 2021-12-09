import { ArmBatchAccount, ArmSubscription, LocalBatchAccount } from "app/models";
import { BehaviorSubject, of } from "rxjs";
import { take } from "rxjs/operators";
import { VmSizeService } from "./vm-size.service";
import {
    badResponseIsNaN,
    responseWithExtraCapability,
    virtualMachineResponse,
    cloudServiceResponse
} from "./vmsize_sample_responses";

const sub1 = new ArmSubscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

describe("VMSizeService", () => {
    let service: VmSizeService;
    let armSpy;
    let accountServiceSpy;

    const testWestusAccount = new ArmBatchAccount({
        id: "/subs/sub-1/batchaccounts/acc-1",
        name: "acc-1",
        location: "westus",
        properties: {} as any,
        subscription: sub1,
    });

    const testBrazilAccount = new ArmBatchAccount({
        id: "/subs/sub-1/batchaccounts/acc-2",
        name: "acc-2",
        location: "brazilsouth",
        properties: {} as any,
        subscription: sub1,
    });

    // westus account
    const westusCloudServiceQuery = `/subscriptions/${testWestusAccount.subscription.subscriptionId}/providers/Microsoft.Batch/locations/${testWestusAccount.location}/cloudServiceSkus?api-version=2021-06-01`;
    const westusVMQuery = `/subscriptions/${testWestusAccount.subscription.subscriptionId}/providers/Microsoft.Batch/locations/${testWestusAccount.location}/virtualMachineSkus?api-version=2021-06-01`;
    // brazilsouth account
    const brazilCloudServiceQuery = `/subscriptions/${testBrazilAccount.subscription.subscriptionId}/providers/Microsoft.Batch/locations/${testBrazilAccount.location}/cloudServiceSkus?api-version=2021-06-01`
    const brazilVMQuery = `/subscriptions/${testBrazilAccount.subscription.subscriptionId}/providers/Microsoft.Batch/locations/${testBrazilAccount.location}/virtualMachineSkus?api-version=2021-06-01`

    beforeEach(() => {
        armSpy = {
            get: jasmine.createSpy("arm.get")
                .withArgs(westusVMQuery).and.returnValue(of(virtualMachineResponse))
                .withArgs(westusCloudServiceQuery).and.returnValue(of(cloudServiceResponse))
                .withArgs(brazilCloudServiceQuery).and.returnValue(of(cloudServiceResponse))
                .withArgs(brazilVMQuery).and.returnValue(of(virtualMachineResponse))
        };

        accountServiceSpy = {
            currentAccount: new BehaviorSubject(testWestusAccount),
        };
        service = new VmSizeService(armSpy, accountServiceSpy);
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it("use the batch account subscription and location for the sizes", async () => {
        expect(armSpy.get).toHaveBeenCalledTimes(0);
        await service.sizes.pipe(take(1)).toPromise();
        expect(armSpy.get).toHaveBeenCalledWith(westusVMQuery);
        expect(armSpy.get).toHaveBeenCalledWith(westusCloudServiceQuery);
    });

    it("only calls the vm sizes api once per account", async () => {
        await service.sizes.pipe(take(1)).toPromise();
        expect(armSpy.get).toHaveBeenCalledTimes(2);
        await service.sizes.pipe(take(1)).toPromise();
        expect(armSpy.get).toHaveBeenCalledTimes(2);
    });

    it("calls again when batch account changes", async () => {
        expect(armSpy.get).toHaveBeenCalledTimes(0);

        const sizeSub = service.sizes.subscribe();
        expect(armSpy.get).toHaveBeenCalledTimes(2);

        accountServiceSpy.currentAccount.next(testBrazilAccount);

        await service.sizes.pipe(take(1)).toPromise();
        expect(armSpy.get).toHaveBeenCalledTimes(4);
        expect(armSpy.get).toHaveBeenCalledWith(brazilCloudServiceQuery);
        expect(armSpy.get).toHaveBeenCalledWith(brazilVMQuery);
        sizeSub.unsubscribe();
    });

    it("gets the sizes", async () => {
        const sizes = await service.sizes.pipe(take(1)).toPromise();
        expect(sizes).not.toBeFalsy();

        expect(sizes!.toJS()).toEqual([
            {
                id: "standard_a1",
                name: "Standard_A1",
                numberOfCores: 1,
                numberOfGpus: 0,
                osDiskSizeInMB: 1047552,
                resourceDiskSizeInMB: 71680,
                memoryInMB: 1792,
                maxDataDiskCount: 2,
            },
            {
                id: "standard_d1",
                name: "Standard_D1",
                numberOfCores: 1,
                numberOfGpus: 2,
                osDiskSizeInMB: 1047552,
                resourceDiskSizeInMB: 51200,
                memoryInMB: 3584,
                maxDataDiskCount: 4,
            },
        ]);
    });

    it("gets the size with invalid response data", async () => {
        armSpy = {
            get: jasmine.createSpy("arm.get").and.returnValue(of(badResponseIsNaN)),
        };
        const serviceWithNaN = new VmSizeService(armSpy, accountServiceSpy);
        const sizes = await serviceWithNaN.sizes.pipe(take(1)).toPromise();
        expect(sizes).not.toBeFalsy();

        expect(sizes!.toJS()).toEqual([
            {
                id: "standard_a0",
                name: "Standard_A0",
                numberOfCores: 0,
                numberOfGpus: 0,
                osDiskSizeInMB: 1047552,
                resourceDiskSizeInMB: 20480,
                memoryInMB: 768,
                maxDataDiskCount: 1,
            }
        ]);
    });

    it("gets the size with extra capability in response data", async () => {
        armSpy = {
            get: jasmine.createSpy("arm.get").and.returnValue(of(responseWithExtraCapability)),
        };
        const serviceWithExtraCap = new VmSizeService(armSpy, accountServiceSpy);
        const sizes = await serviceWithExtraCap.sizes.pipe(take(1)).toPromise();
        expect(sizes).not.toBeFalsy();

        expect(sizes!.toJS()).toEqual([
            {
                id: "standard_a0",
                name: "Standard_A0",
                numberOfCores: 1,
                numberOfGpus: 0,
                osDiskSizeInMB: 1047552,
                resourceDiskSizeInMB: 20480,
                memoryInMB: 768,
                maxDataDiskCount: 1,
            }
        ]);
    });

    it("filters the IAAS sizes", async () => {
        const sizes = await service.virtualMachineSizes.pipe(take(1)).toPromise();
        expect(sizes).not.toBeFalsy();
        expect(sizes!.toJS().map(x => x.id)).toEqual([
            "standard_a1",
            "standard_d1",
        ]);
    });

    it("filters the Cloud Service sizes", async () => {
        const sizes = await service.cloudServiceSizes.pipe(take(1)).toPromise();
        expect(sizes).not.toBeFalsy();
        expect(sizes!.toJS().map(x => x.id)).toEqual([
            "small",
            "standard_d1",
        ]);
    });

    it("returns null for the sizes when using local batch account", async () => {
        accountServiceSpy.currentAccount.next(new LocalBatchAccount({}));
        const vmSizes = await service.virtualMachineSizes.pipe(take(1)).toPromise();
        expect(vmSizes).toBeFalsy();
        const cloudServiceSizes = await service.cloudServiceSizes.pipe(take(1)).toPromise();
        expect(cloudServiceSizes).toBeFalsy();
        const sizes = await service.sizes.pipe(take(1)).toPromise();
        expect(sizes).toBeFalsy();
    });

    it("get a size by id", async () => {
        const size1 = await service.get("standard_a1").toPromise();
        expect(size1.toJS()).toEqual({
            id: "standard_a1",
            name: "Standard_A1",
            numberOfCores: 1,
            numberOfGpus: 0,
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
            numberOfGpus: 2,
            osDiskSizeInMB: 1047552,
            resourceDiskSizeInMB: 51200,
            memoryInMB: 3584,
            maxDataDiskCount: 4,
        });
    });
});

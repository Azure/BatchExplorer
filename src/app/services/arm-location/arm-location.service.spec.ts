import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AccessToken } from "@batch-flask/core";
import { ArmLocation, ArmSubscription, TenantDetails } from "app/models";
import { Constants } from "common";
import { List } from "immutable";
import { BehaviorSubject, of } from "rxjs";
import { AuthService } from "../aad";
import { AzureHttpService } from "../azure-http.service";
import { BatchExplorerService } from "../batch-explorer.service";
import { ArmLocationService } from "./arm-location.service";

const tenantDetails: StringMap<TenantDetails> = {
    "tenant-1": new TenantDetails({ displayName: "Tenant 1" }),
    "tenant-2": new TenantDetails({ displayName: "Tenant 2" }),
};

const tokens: StringMap<AccessToken> = {
    "tenant-1": new AccessToken({ accessToken: "tenant-1-token", tokenType: "Bearer" } as any),
    "tenant-2": new AccessToken({ accessToken: "tenant-2-token", tokenType: "Bearer" } as any),
};

const sub1 = new ArmSubscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
    tenantId: "tenant-2",
    tenant: tenantDetails["tenant-2"],
});

const loc1 = new ArmLocation({
    id: "/subscriptions/sub1/locations/eastus",
    name: "eastus",
    displayName: "East US",
    latitude: "555",
    longitude: "666",
});

const loc2 = new ArmLocation({
    id: "/subscriptions/sub1/locations/centralus",
    name: "centralus",
    displayName: "Central US",
    latitude: "333",
    longitude: "444",
});

const loc3 = new ArmLocation({
    id: "/subscriptions/sub1/locations/westus",
    name: "westus",
    displayName: "West US",
    latitude: "111",
    longitude: "222",
});

const batchLoc1 = new ArmLocation({
    id: "/subscriptions/sub1/locations/eastasia",
    name: "eastasia",
    displayName: "East Asia",
});

const batchLoc2 = new ArmLocation({
    id: "/subscriptions/sub1/locations/brazilsouth",
    name: "brazilsouth",
    displayName: "Brazil South",
});

describe("ArmLocationService", () => {
    let service: ArmLocationService;

    let authSpy;
    let armProviderServiceSpy;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        authSpy = {
            tenantsIds: new BehaviorSubject(["tenant-1", "tenant-2"]),
            accessTokenData: jasmine.createSpy("accessTokenData").and.callFake((id) => {
                return of(tokens[id]);
            }),
        };

        armProviderServiceSpy = {
            getResourceType: jasmine.createSpy("getResourceType").and.returnValue(of({
                locations: List(["West US", "Central US", "East US", "East Asia", "Brazil South"]),
            })),
        };
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                AzureHttpService,
                {
                    provide: BatchExplorerService, useValue: {
                        azureEnvironment: {
                            arm: "https://management.azure.com/",
                        },
                    },
                },
                { provide: AuthService, useValue: authSpy },
            ],
        });

        httpMock = TestBed.get(HttpTestingController);

        service = new ArmLocationService(TestBed.get(AzureHttpService), armProviderServiceSpy);
    });

    it("list locations for the subscription", (done) => {
        service.list(sub1).subscribe((locations) => {
            expect(locations.map(x => x.toJS())).toEqual([
                loc1.toJS(), loc2.toJS(), loc3.toJS(),
            ]);
            done();
        });

        const reqs = httpMock.expectOne(
            `https://management.azure.com/subscriptions/sub1/locations?api-version=${Constants.ApiVersion.arm}`,
        );
        expect(reqs.request.body).toBe(null);

        reqs.flush({
            value: [loc1.toJS(), loc2.toJS(), loc3.toJS()],
        });
    });

    it("list locations for a given provider", (done) => {
        service.listForResourceType(sub1, "Microsoft.Batch", "batchAccounts").subscribe((locations) => {
            expect(locations.map(x => x.toJS())).toEqual([
                loc3.toJS(), loc2.toJS(), loc1.toJS(), batchLoc1.toJS(), batchLoc2.toJS(),
            ]);
            done();
        });

        expect(armProviderServiceSpy.getResourceType).toHaveBeenCalledOnce();
        expect(armProviderServiceSpy.getResourceType).toHaveBeenCalledWith(
            sub1, "Microsoft.Batch", "batchAccounts");

        const reqs = httpMock.expectOne(
            `https://management.azure.com/subscriptions/sub1/locations?api-version=${Constants.ApiVersion.arm}`,
        );
        expect(reqs.request.body).toBe(null);

        reqs.flush({
            value: [loc1.toJS(), loc2.toJS(), loc3.toJS()],
        });
    });
});

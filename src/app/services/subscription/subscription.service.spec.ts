import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AccessToken } from "@batch-flask/core";
import { MockUserConfigurationService } from "@batch-flask/core/testing";
import { ArmSubscription, TenantDetails } from "app/models";
import { Constants } from "common";
import { BehaviorSubject, of } from "rxjs";
import { AuthService } from "../aad";
import { AzureHttpService } from "../azure-http.service";
import { BatchExplorerService } from "../batch-explorer.service";
import { SubscriptionService } from "./subscription.service";

const tenantDetails: StringMap<TenantDetails> = {
    "tenant-1": new TenantDetails({ tenantId: "tenant-1", displayName: "Tenant 1" }),
    "tenant-2": new TenantDetails({ tenantId: "tenant-2", displayName: "Tenant 2" }),
};

const tokens: StringMap<AccessToken> = {
    "tenant-1": new AccessToken({ access_token: "tenant-1-token", token_type: "Bearer" } as any),
    "tenant-2": new AccessToken({ access_token: "tenant-2-token", token_type: "Bearer" } as any),
};

const sub1Res = {
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
};

const sub1 = new ArmSubscription({
    ...sub1Res,
    tenantId: "tenant-2",
    tenant: tenantDetails["tenant-2"],
});

const sub2Res = {
    id: "/subscriptions/sub2",
    subscriptionId: "sub2",
};

const sub2 = new ArmSubscription({
    ...sub2Res,
    tenantId: "tenant-1",
    tenant: tenantDetails["tenant-1"],
});

const sub3Res = {
    id: "/subscriptions/sub3",
    subscriptionId: "sub3",
};

const sub3 = new ArmSubscription({
    ...sub3Res,
    tenantId: "tenant-2",
    tenant: tenantDetails["tenant-2"],
});

describe("SubscriptionService", () => {
    let service: SubscriptionService;

    let authSpy;
    let settingsServiceSpy: MockUserConfigurationService;
    let httpMock: HttpTestingController;
    let subscriptions: ArmSubscription[] = [];

    beforeEach(() => {
        authSpy = {
            tenants: new BehaviorSubject(Object.values(tenantDetails)),
            accessTokenData: jasmine.createSpy("accessTokenData").and.callFake((id) => {
                return of(tokens[id]);
            }),
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

        settingsServiceSpy = new MockUserConfigurationService({});
        service = new SubscriptionService(
            TestBed.get(AzureHttpService),
            TestBed.get(AuthService),
            settingsServiceSpy
        );
        service.subscriptions.subscribe(x => subscriptions = x.toJS());
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it("loads all the subscriptions for each of the tenants", (done) => {
        service.load().subscribe(() => {
            expect(subscriptions).toEqual([
                sub2.toJS(), sub1.toJS(), sub3.toJS(),
            ]);
            done();
        });

        const reqs = httpMock.match({
            url: `https://management.azure.com/subscriptions?api-version=${Constants.ApiVersion.arm}`,
            method: "GET",
        });
        expect(reqs.length).toEqual(2);
        expect(reqs[0].request.body).toBe(null);
        expect(reqs[0].request.headers.get("Authorization")).toEqual("Bearer tenant-1-token");
        expect(reqs[1].request.body).toBe(null);
        expect(reqs[1].request.headers.get("Authorization")).toEqual("Bearer tenant-2-token");

        reqs[0].flush({
            value: [sub2Res],
        });
        reqs[1].flush({
            value: [sub1Res],
            nextLink: `https://management.azure.com/subscriptions?api-version=${Constants.ApiVersion.arm}&token=next-foo`,
        });

        const nextReq = httpMock.expectOne({
            url: `https://management.azure.com/subscriptions?api-version=${Constants.ApiVersion.arm}&token=next-foo`,
            method: "GET",
        });
        expect(nextReq.request.body).toBe(null);
        expect(nextReq.request.headers.get("Authorization")).toEqual("Bearer tenant-2-token");

        nextReq.flush({
            value: [sub3Res],
        });
    });
});

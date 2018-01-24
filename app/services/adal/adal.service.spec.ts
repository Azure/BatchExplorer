import * as moment from "moment";

import { AdalService } from "app/services/adal";
import { AccessToken } from "client/core/aad/access-token/access-token.model";
import { Observable } from "rxjs";
import { F } from "test/utils";

const tenant1 = "tenant-1";
const resource1 = "http://example.com";
const token1 = new AccessToken({
    access_token: "sometoken",
    expires_on: moment().add(1, "hour").toDate(),
    expires_in: 3600,
    token_type: "Bearer",
    ext_expires_in: 3600,
    not_before: moment().add(1, "hour").toDate(),
    refresh_token: "foorefresh",
});

describe("AdalService spec", () => {
    let service: AdalService;
    let aadServiceSpy;
    let remoteSpy;

    beforeEach(() => {
        aadServiceSpy = {
            tenantsIds: Observable.of([]),
        };
        remoteSpy = {
            getBatchLabsApp: () => ({ aadService: aadServiceSpy }),
            send: jasmine.createSpy("accessTokenData").and.returnValue(Promise.resolve(token1)),
        };
        service = new AdalService(remoteSpy);
    });

    it("#accessTokenFor returns observable with token string", (done) => {
        service.accessTokenFor(tenant1, resource1).subscribe((token) => {
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(token).toEqual(token1.access_token);
            done();
        });
    });

    it("#accessTokenData returns observable with token", (done) => {
        service.accessTokenData(tenant1, resource1).subscribe((token) => {
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(token).toEqual(token1);
            done();
        });
    });

    describe("#accessTokenDataAsync", () => {
        it("load a new token by calling aadService", F(async () => {
            const token = await service.accessTokenDataAsync(tenant1, resource1);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(token).toEqual(token1);
        }));

        it("load a new token by calling aadService", F(async () => {
            const tokenA = await service.accessTokenDataAsync(tenant1, resource1);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(tokenA).toEqual(token1);
            const tokenB = await service.accessTokenDataAsync(tenant1, resource1);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(tokenB).toEqual(token1);
        }));

        it("cache the promise so it doesn't call the main process twice", F(async () => {
            const promiseA = service.accessTokenDataAsync(tenant1, resource1);
            const promiseB = service.accessTokenDataAsync(tenant1, resource1);
            const [tokenA, tokenB] = await Promise.all([promiseA, promiseB]);
            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(tokenA).toEqual(token1);
            expect(tokenB).toEqual(token1);
        }));
    });
});

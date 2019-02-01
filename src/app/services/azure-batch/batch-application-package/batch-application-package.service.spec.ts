import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { BatchApplicationPackage, PackageState } from "app/models";
import { BehaviorSubject } from "rxjs";
import { BatchApplicationPackageService } from "./batch-application-package.service";

const date1 = new Date();
const app1Id = "/subs/sub-1/batchaccounts/acc-1/applications/app-1";

describe("BatchApplicationPackageService", () => {
    let packageService: BatchApplicationPackageService;
    let httpMock: HttpTestingController;
    let accountServiceSpy;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                BatchApplicationPackageService,
            ],
        });

        accountServiceSpy = {
            currentAccountId: new BehaviorSubject("/subs/sub-1/batchaccounts/acc-1"),
        };

        packageService = new BatchApplicationPackageService(TestBed.get(HttpClient) as any, accountServiceSpy);
        httpMock = TestBed.get(HttpTestingController);
    });

    it("get an application", (done) => {
        packageService.get(`${app1Id}/versions/1.0`).subscribe((pkg: BatchApplicationPackage) => {
            expect(pkg instanceof BatchApplicationPackage).toBe(true);
            expect(pkg.id).toEqual(`${app1Id}/versions/1.0`);
            expect(pkg.name).toEqual("1.0");
            expect(pkg.properties.state).toEqual(PackageState.pending);
            expect(pkg.properties.storageUrl).toEqual("https://storage.com/bar");
            expect(pkg.properties.storageUrlExpiry).toEqual(date1);

            done();
        });

        const req = httpMock.expectOne({
            url: `${app1Id}/versions/1.0`,
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            id: `${app1Id}/versions/1.0`,
            name: "1.0",
            properties: {
                state: PackageState.pending,
                storageUrl: "https://storage.com/bar",
                storageUrlExpiry: date1,
            },
        });
        httpMock.verify();
    });

    it("list applications", (done) => {
        packageService.list(app1Id).subscribe((response) => {
            const apps = response.items;
            expect(apps.size).toBe(1);
            const app = apps.first();
            expect(app.id).toEqual(`${app1Id}/versions/1.0`);
            expect(app.name).toEqual("1.0");
            expect(app.properties.state).toEqual(PackageState.pending);
            expect(app.properties.storageUrl).toEqual("https://storage.com/bar");
            expect(app.properties.storageUrlExpiry).toEqual(date1);

            done();
        });

        const req = httpMock.expectOne({
            url: `${app1Id}/versions`,
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            value: [{
                id: `${app1Id}/versions/1.0`,
                name: "1.0",
                properties: {
                    state: PackageState.pending,
                    storageUrl: "https://storage.com/bar",
                    storageUrlExpiry: date1,
                },
            }],
        });
        httpMock.verify();
    });

    it("delete application", (done) => {
        packageService.delete(`${app1Id}/versions/1.0`).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: `${app1Id}/versions/1.0`,
            method: "DELETE",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("activate package", (done) => {
        packageService.activate(`${app1Id}/versions/1.0`).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: `${app1Id}/versions/1.0/activate`,
            method: "POST",
        });
        expect(req.request.body).toEqual({
            format: "zip",
        });
        req.flush("");
        httpMock.verify();
    });

    it("create package", (done) => {
        packageService.put("app-1", "1.0").subscribe((pkg: BatchApplicationPackage) => {
            expect(pkg instanceof BatchApplicationPackage).toBe(true);
            expect(pkg.id).toEqual(`${app1Id}/versions/1.0`);
            expect(pkg.name).toEqual("1.0");
            expect(pkg.properties.state).toEqual(PackageState.pending);
            expect(pkg.properties.storageUrl).toEqual("https://storage.com/bar");
            expect(pkg.properties.storageUrlExpiry).toEqual(date1);

            done();
        });

        const req = httpMock.expectOne({
            url: `${app1Id}/versions/1.0`,
            method: "PUT",
        });
        expect(req.request.body).toEqual(null);
        req.flush({
            id: `${app1Id}/versions/1.0`,
            name: "1.0",
            properties: {
                state: PackageState.pending,
                storageUrl: "https://storage.com/bar",
                storageUrlExpiry: date1,
            },
        });
        httpMock.verify();
    });
});

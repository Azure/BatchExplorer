import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { BatchApplication } from "app/models";
import { BehaviorSubject } from "rxjs";
import { BatchApplicationService } from "./batch-application.service";

describe("BatchApplicationService", () => {
    let applicationService: BatchApplicationService;
    let httpMock: HttpTestingController;
    let accountServiceSpy;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                BatchApplicationService,
            ],
        });

        accountServiceSpy = {
            currentAccountId: new BehaviorSubject("/subs/sub-1/batchaccounts/acc-1"),
        };

        applicationService = new BatchApplicationService(TestBed.get(HttpClient) as any, accountServiceSpy);
        httpMock = TestBed.get(HttpTestingController);
    });

    it("get an application", (done) => {
        applicationService.get(
            "/subs/sub-1/batchaccounts/acc-1/applications/app-1",
        ).subscribe((app: BatchApplication) => {
            expect(app instanceof BatchApplication).toBe(true);
            expect(app.id).toEqual("/subs/sub-1/batchaccounts/acc-1/applications/app-1");
            expect(app.name).toEqual("app-1");
            expect(app.properties.allowUpdates).toEqual(true);
            expect(app.properties.displayName).toEqual("My first app");
            expect(app.properties.defaultVersion).toEqual("1.0");

            done();
        });

        const req = httpMock.expectOne({
            url: "/subs/sub-1/batchaccounts/acc-1/applications/app-1",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            id: "/subs/sub-1/batchaccounts/acc-1/applications/app-1",
            name: "app-1",
            properties: {
                allowUpdates: true,
                displayName: "My first app",
                defaultVersion: "1.0",
            },
        });
        httpMock.verify();
    });

    it("list applications", (done) => {
        applicationService.list().subscribe((response) => {
            const apps = response.items;
            expect(apps.size).toBe(1);
            const app = apps.first();
            expect(app.id).toEqual("/subs/sub-1/batchaccounts/acc-1/applications/app-1");
            expect(app.name).toEqual("app-1");
            expect(app.properties.allowUpdates).toEqual(true);
            expect(app.properties.displayName).toEqual("My first app");
            expect(app.properties.defaultVersion).toEqual("1.0");
            done();
        });

        const req = httpMock.expectOne({
            url: "/subs/sub-1/batchaccounts/acc-1/applications",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            value: [{
                id: "/subs/sub-1/batchaccounts/acc-1/applications/app-1",
                name: "app-1",
                properties: {
                    allowUpdates: true,
                    displayName: "My first app",
                    defaultVersion: "1.0",
                },
            }],
        });
        httpMock.verify();
    });

    it("delete application", (done) => {
        applicationService.delete("/subs/sub-1/batchaccounts/acc-1/applications/app-1").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/subs/sub-1/batchaccounts/acc-1/applications/app-1",
            method: "DELETE",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("patch application", (done) => {
        const patchdto = {
            properties: {
                allowUpdates: false,
                displayName: "My modifed app",
                defaultVersion: "2.0",
            },
        };
        applicationService.patch("app-1", patchdto).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/subs/sub-1/batchaccounts/acc-1/applications/app-1",
            method: "PATCH",
        });
        expect(req.request.body).toEqual({
            properties: {
                allowUpdates: false,
                displayName: "My modifed app",
                defaultVersion: "2.0",
            },
        });
        req.flush("");
        httpMock.verify();
    });
});

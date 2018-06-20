import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Pool } from "app/models";
import { NodeDeallocationOption, PoolEnableAutoScaleDto, PoolPatchDto, PoolResizeDto } from "app/models/dtos";
import * as moment from "moment";
import { PoolService } from "./pool.service";

describe("PoolService", () => {
    let poolService: PoolService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                PoolService,
            ],
        });
        poolService = new PoolService(TestBed.get(HttpClient));
        httpMock = TestBed.get(HttpTestingController);
    });

    it("get a pool", (done) => {
        poolService.get("pool-1").subscribe((pool: Pool) => {
            expect(pool instanceof Pool).toBe(true);
            expect(pool.id).toEqual("pool-1");
            expect(pool.displayName).toEqual("Pool 1");
            expect(pool.targetDedicatedNodes).toEqual(1);
            expect(pool.targetLowPriorityNodes).toEqual(2);
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            id: "pool-1",
            displayName: "Pool 1",
            targetDedicatedNodes: 1,
            targetLowPriorityNodes: 2,
        });
        httpMock.verify();
    });

    it("list pool", (done) => {
        poolService.list().subscribe((response) => {
            const pools = response.items;
            expect(pools.size).toBe(1);
            const pool = pools.first();
            expect(pool instanceof Pool).toBe(true);
            expect(pool.id).toEqual("pool-1");
            expect(pool.displayName).toEqual("Pool 1");
            expect(pool.targetDedicatedNodes).toEqual(1);
            expect(pool.targetLowPriorityNodes).toEqual(2);
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            value: [{
                id: "pool-1",
                displayName: "Pool 1",
                targetDedicatedNodes: 1,
                targetLowPriorityNodes: 2,
            }],
        });
        httpMock.verify();
    });

    it("delete pool", (done) => {
        poolService.delete("pool-1").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1",
            method: "DELETE",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("resize pool", (done) => {
        const resizeDto = new PoolResizeDto({
            targetDedicatedNodes: 4,
            targetLowPriorityNodes: 2,
            nodeDeallocationOption: NodeDeallocationOption.retaineddata,
        });
        poolService.resize("pool-1", resizeDto).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/resize",
            method: "POST",
        });
        expect(req.request.body).toEqual({
            targetDedicatedNodes: 4,
            targetLowPriorityNodes: 2,
            nodeDeallocationOption: NodeDeallocationOption.retaineddata,
        });
        req.flush("");
        httpMock.verify();
    });

    it("patch pool", (done) => {
        const patchdto = new PoolPatchDto({
            metadata: [
                { name: "abc", value: "foo" },
            ],
        });
        poolService.patch("pool-1", patchdto).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1",
            method: "PATCH",
        });
        expect(req.request.body).toEqual({
            metadata: [
                { name: "abc", value: "foo" },
            ],
        });
        req.flush("");
        httpMock.verify();
    });

    it("update pool", (done) => {
        const patchdto = new PoolPatchDto({
            startTask: {
                commandLine: "hostname",
                resourceFiles: null,
            },
        });
        poolService.replaceProperties("pool-1", patchdto).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1",
            method: "POST",
        });
        expect(req.request.body).toEqual({
            startTask: {
                commandLine: "hostname",
            },
        });
        req.flush("");
        httpMock.verify();
    });

    it("evaluate autoscale", (done) => {
        const formula = "$targetDedicatedNodes=1;";
        poolService.evaluateAutoScale("pool-1", formula).subscribe((res) => {
            expect(res.results.size).toBe(2);
            expect(res.results.get(0).name).toEqual("$targetDedicatedNodes");
            expect(res.results.get(0).value).toEqual("1");
            expect(res.results.get(1).name).toEqual("$targetLowPriorityNodes");
            expect(res.results.get(1).value).toEqual("2");
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/evaluateautoscale",
            method: "POST",
        });
        expect(req.request.body).toEqual({
            autoScaleFormula: formula,
        });
        req.flush({
            results: "$targetDedicatedNodes=1;$targetLowPriorityNodes=2;",
        });
        httpMock.verify();
    });

    it("enable autoscale", (done) => {
        const formula = "$targetDedicatedNodes=1;";

        poolService.enableAutoScale("pool-1", new PoolEnableAutoScaleDto({
            autoScaleFormula: formula,
            autoScaleEvaluationInterval: moment.duration({ minutes: 50 }),
        })).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/enableautoscale",
            method: "POST",
        });
        expect(req.request.body).toEqual({
            autoScaleFormula: formula,
            autoScaleEvaluationInterval: moment.duration({ minutes: 50 }),
        });
        req.flush("");
        httpMock.verify();
    });

    it("disable autoscale", (done) => {
        poolService.disableAutoScale("pool-1").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/disableautoscale",
            method: "POST",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

});

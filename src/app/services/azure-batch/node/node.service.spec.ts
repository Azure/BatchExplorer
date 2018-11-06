import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Node, NodeState } from "app/models";
import { NodeService } from "./node.service";

describe("NodeService", () => {
    let nodeService: NodeService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                NodeService,
            ],
        });
        nodeService = new NodeService(null, TestBed.get(HttpClient));
        httpMock = TestBed.get(HttpTestingController);
    });

    it("get a node", (done) => {
        nodeService.get("pool-1", "node-2").subscribe((node: Node) => {
            expect(node instanceof Node).toBe(true);
            expect(node.id).toEqual("node-2");
            expect(node.state).toEqual(NodeState.idle);
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/nodes/node-2",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            id: "node-2",
            state: "idle",
        });
        httpMock.verify();
    });

    it("list pool", (done) => {
        nodeService.list("pool-1").subscribe((response) => {
            const nodes = response.items;
            expect(nodes.size).toBe(1);
            const node = nodes.first();
            expect(node instanceof Node).toBe(true);
            expect(node.id).toEqual("node-2");
            expect(node.state).toEqual(NodeState.running);
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/nodes",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            value: [{
                id: "node-2",
                state: "running",
            }],
        });
        httpMock.verify();
    });

    it("delete a node", (done) => {
        nodeService.delete("pool-1", "node-2").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/removenodes",
            method: "POST",
        });
        expect(req.request.body).toEqual({ nodeList: ["node-2"] });
        req.flush("");
        httpMock.verify();
    });

    it("reboot a node", (done) => {
        nodeService.reboot("pool-1", "node-2").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/nodes/node-2/reboot",
            method: "POST",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("reimage a node", (done) => {
        nodeService.reimage("pool-1", "node-2").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/nodes/node-2/reimage",
            method: "POST",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("uploads node logs", (done) => {
        const data = {
            containerUrl: "some-container",
            startTime: new Date(),
            endTime: new Date(),
        };
        nodeService.uploadLogs("pool-1", "node-2", data).subscribe((res) => {
            expect(res).toEqual({
                virtualDirectoryName: "pool-1/node-2/0795539d-82fe-48e3-bbff-2964905b6de0",
                numberOfFilesUploaded: 8,
            });
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/nodes/node-2/uploadbatchservicelogs",
            method: "POST",
        });
        expect(req.request.body).toEqual(data);
        req.flush({
            virtualDirectoryName: "pool-1/node-2/0795539d-82fe-48e3-bbff-2964905b6de0",
            numberOfFilesUploaded: 8,
        });
        httpMock.verify();
    });
});

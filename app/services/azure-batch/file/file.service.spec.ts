import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { File } from "app/models";
import { ListOptions } from "app/services/core";
import { FileService } from "./file.service";

const creationTime = new Date(2018, 4, 20);
const lastModified = new Date(2018, 6, 24);

describe("FileService", () => {
    let fileService: FileService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                FileService,
            ],
        });
        fileService = new FileService(TestBed.get(HttpClient), null);
        httpMock = TestBed.get(HttpTestingController);
    });

    it("get a node file", (done) => {

        fileService.getFilePropertiesFromComputeNode("pool-1", "node-2", "file-1.txt").subscribe((file: File) => {
            expect(file instanceof File).toBe(true);
            expect(file.name).toEqual("file-1.txt");
            expect(file.isDirectory).toBe(false);
            expect(file.properties.contentLength).toEqual(260);
            expect(file.properties.contentType).toEqual("application/octet-stream");
            expect(file.properties.creationTime).toEqual(creationTime);
            expect(file.properties.lastModified).toEqual(lastModified);
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/nodes/node-2/files/file-1.txt",
            method: "HEAD",
        });
        expect(req.request.body).toBe(null);
        req.flush(null, {
            headers: {
                "ocp-batch-file-isdirectory": "False",
                "ocp-batch-file-url": "/pools/pool-1/nodes/node-2/files/file-1.txt",
                "content-length": "260",
                "ocp-creation-time": creationTime.toString(),
                "last-modified": lastModified.toString(),
                "content-type": "application/octet-stream",
            },
        });
        httpMock.verify();
    });
    describe("listFiles", () => {
        function expectList() {
            return httpMock.expectOne(req => req.method === "GET" && req.url === "/pools/pool-1/nodes/node-2/files");
        }

        it("list file non recursively", (done) => {
            fileService.listFromNode("pool-1", "node-2").subscribe((response) => {
                const files = response.items;
                expect(files.size).toBe(2);
                const dir = files.get(0);
                expect(dir instanceof File).toBe(true);
                expect(dir.name).toBe("shared");
                expect(dir.isDirectory).toBe(true);

                const file = files.get(1);
                expect(file instanceof File).toBe(true);
                expect(file.name).toEqual("startup/ProcessEnv.cmd");
                expect(file.isDirectory).toBe(false);
                expect(file.properties.contentLength).toEqual(1813);
                expect(file.properties.contentType).toEqual("application/octet-stream");
                expect(file.properties.creationTime).toEqual(creationTime);
                expect(file.properties.lastModified).toEqual(lastModified);
                done();
            });

            const req = expectList();
            expect(req.request.params.get("recursive").toString()).toBe("false");
            expect(req.request.params.has("$filter")).toBe(false);
            expect(req.request.body).toBe(null);
            req.flush({
                value: [{
                    name: "shared",
                    url: "/pools/pool-1/nodes/node-2/files/shared",
                    isDirectory: true,
                },
                {
                    name: "startup/ProcessEnv.cmd",
                    url: "/pools/pool-1/nodes/node-2/files/startup/ProcessEnv.cmd",
                    isDirectory: false,
                    properties: {
                        creationTime: creationTime.toString(),
                        lastModified: lastModified.toString(),
                        contentLength: 1813,
                        contentType: "application/octet-stream",
                    },
                }],
            });
            httpMock.verify();
        });

        it("list file recursively", (done) => {
            const options = new ListOptions({
                recursive: true,
            });
            fileService.listFromNode("pool-1", "node-2", options).subscribe((response) => {
                done();
            });

            const req = expectList();
            expect(req.request.params.get("recursive").toString()).toBe("true");
            expect(req.request.params.has("$filter")).toBe(false);
            expect(req.request.body).toBe(null);

            httpMock.verify();
        });

        it("list file with folder", (done) => {
            const options = new ListOptions({
                recursive: true,
                folder: "abc",
            });
            fileService.listFromNode("pool-1", "node-2", options).subscribe((response) => {
                done();
            });

            const req = expectList();
            expect(req.request.params.get("recursive").toString()).toBe("true");
            expect(req.request.params.get("$filter")).toBe("startswith(name, 'abc/')");
            expect(req.request.body).toBe(null);

            httpMock.verify();
        });
    });
});

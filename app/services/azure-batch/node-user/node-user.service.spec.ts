import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AddNodeUserAttributes, NodeUserService, UpdateNodeUserAttributes } from "./node-user.service";

const date = new Date();

describe("NodeUserService", () => {
    let nodeUserService: NodeUserService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                NodeUserService,
            ],
        });
        nodeUserService = new NodeUserService(TestBed.get(HttpClient));
        httpMock = TestBed.get(HttpTestingController);
    });

    it("add a node user", (done) => {
        const user: AddNodeUserAttributes = {
            name: "foo",
            password: "bar",
            isAdmin: true,
            expiryTime: date,
        };
        nodeUserService.addUser("pool-1", "node-2", user).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/nodes/node-2/users",
            method: "POST",
        });
        expect(req.request.body).toEqual({
            name: "foo",
            password: "bar",
            isAdmin: true,
            expiryTime: date,
        });
        req.flush("");
        httpMock.verify();
    });

    it("update a node user", (done) => {
        const user: UpdateNodeUserAttributes = {
            password: "bar",
            expiryTime: date,
        };
        nodeUserService.updateUser("pool-1", "node-2", "foo", user).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/nodes/node-2/users/foo",
            method: "PUT",
        });
        expect(req.request.body).toEqual({
            password: "bar",
            expiryTime: date,
        });
        req.flush("");
        httpMock.verify();
    });

    it("delete node user", (done) => {
        nodeUserService.deleteUser("pool-1", "node-2", "node-user-1").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/pools/pool-1/nodes/node-2/users/node-user-1",
            method: "DELETE",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

});

import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Certificate, CertificateState } from "app/models";
import { CertificateService } from "./certificate.service";

describe("CertificateService", () => {
    let certificateService: CertificateService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                CertificateService,
            ],
        });
        certificateService = new CertificateService(TestBed.get(HttpClient));
        httpMock = TestBed.get(HttpTestingController);
    });

    it("get a certificate", (done) => {
        certificateService.get("abcdef", "sha1").subscribe((certificate: Certificate) => {
            expect(certificate instanceof Certificate).toBe(true);
            expect(certificate.id).toEqual("abcdef");
            expect(certificate.thumbprint).toEqual("abcdef");
            expect(certificate.thumbprintAlgorithm).toEqual("sha1");
            expect(certificate.state).toEqual(CertificateState.deletefailed);
            done();
        });

        const req = httpMock.expectOne({
            url: "/certificates(thumbprintAlgorithm=sha1,thumbprint=abcdef)",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            thumbprint: "abcdef",
            thumbprintAlgorithm: "sha1",
            state: "deletefailed",
            stateTransitionTime: "2014-07-31T21:12:58.236Z",
            previousState: "deleting",
            previousStateTransitionTime: "2014-07-31T21:11:58.236Z",
        });
        httpMock.verify();
    });

    it("list certificate", (done) => {
        certificateService.list().subscribe((response) => {
            const certificates = response.items;
            expect(certificates.size).toBe(1);
            const certificate = certificates.first();
            expect(certificate instanceof Certificate).toBe(true);
            expect(certificate.id).toEqual("abcdef");
            expect(certificate.thumbprint).toEqual("abcdef");
            expect(certificate.thumbprintAlgorithm).toEqual("sha1");
            expect(certificate.state).toEqual(CertificateState.deletefailed);
            done();
        });

        const req = httpMock.expectOne({
            url: "/certificates",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            value: [{
                thumbprint: "abcdef",
                thumbprintAlgorithm: "sha1",
                state: "deletefailed",
                stateTransitionTime: "2014-07-31T21:12:58.236Z",
                previousState: "deleting",
                previousStateTransitionTime: "2014-07-31T21:11:58.236Z",
            }],
        });
        httpMock.verify();
    });

    it("delete certificate", (done) => {
        certificateService.delete("abcdef").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/certificates(thumbprintAlgorithm=sha1,thumbprint=abcdef)",
            method: "DELETE",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });
});

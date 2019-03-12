import { MockGlobalStorage, MockUserConfigurationService } from "@batch-flask/core/testing";
import { Subject } from "rxjs";
import { tap } from "rxjs/operators";
import { Portfolio, PortfolioReference, PortfolioType } from "./portfolio";
import { MICROSOFT_PORTFOLIO, PortfolioService } from "./portfolio.service";

const ref1: PortfolioReference = {
    id: "my-portfolio-1",
    source: "https://github.com/my/custom1",
    type: PortfolioType.Github,
};

const ref2: PortfolioReference = {
    id: "my-portfolio-2",
    source: "https://github.com/my/custom2",
    type: PortfolioType.Github,
};

describe("Portfolio Service", () => {
    let service: PortfolioService;
    let fsSpy;
    let globalStorageSpy;
    let settingsServiceSpy: MockUserConfigurationService;
    let portfolios: Portfolio[];
    let resolvePortfolio;

    beforeEach(() => {
        resolvePortfolio = new Subject();
        globalStorageSpy = new MockGlobalStorage();
        globalStorageSpy.set("portfolios", {
            portfolios: [ref1, ref2],
        });
        fsSpy = {

        };

        spyOnProperty(Portfolio.prototype, "ready").and.returnValue(resolvePortfolio);

        settingsServiceSpy = new MockUserConfigurationService({
            microsoftPortfolio: {
                branch: "master",
                repo: "Azure/batch-extension-templates",
                path: "templates",
            },
        });
        service = new PortfolioService(globalStorageSpy, fsSpy, settingsServiceSpy);
        service.portfolios.subscribe(x => portfolios = x);
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it("Loaded the portfolios", () => {
        expect(portfolios.length).toEqual(3);
        expect(portfolios[0] instanceof Portfolio).toBe(true);
        expect(portfolios[1] instanceof Portfolio).toBe(true);
        expect(portfolios[2] instanceof Portfolio).toBe(true);

        expect(portfolios[0].reference).toEqual({
            id: MICROSOFT_PORTFOLIO.id,
            type: PortfolioType.Github,
            source: "https://github.com/Azure/BatchExplorer-data/tree/master",
        });
        expect(portfolios[1].reference).toEqual(ref1);
        expect(portfolios[2].reference).toEqual(ref2);
    });

    describe("when settings change", () => {
        it("changes the portfolio list", () => {
            portfolios = null;
            settingsServiceSpy.patch({
                githubData: {
                    branch: "feature/test-1",
                    repo: "Azure/BatchExplorer-data",
                },
            });

            expect(portfolios.length).toEqual(3);
            expect(portfolios[0].reference).toEqual({
                id: MICROSOFT_PORTFOLIO.id,
                type: PortfolioType.Github,
                source: "https://github.com/Azure/BatchExplorer-data/tree/feature/test-1",
            });
            expect(portfolios[1].reference).toEqual(ref1);
            expect(portfolios[2].reference).toEqual(ref2);
        });

        it("doesn't update the list if other settings are updated", () => {
            portfolios = null;
            settingsServiceSpy.patch({
                some: "other",
            });

            expect(portfolios).toBe(null);
        });
    });

    it("get a portfolio by id", async () => {
        let portfolio = await service.get(MICROSOFT_PORTFOLIO.id).toPromise();
        expect(portfolio.reference).toEqual({
            id: MICROSOFT_PORTFOLIO.id,
            type: PortfolioType.Github,
            source: "https://github.com/Azure/BatchExplorer-data/tree/master",
        });
        portfolio = await service.get("my-portfolio-2").toPromise();
        expect(portfolio.reference).toEqual(ref2);
    });

    it("get a portfolio by id and wait for data to be ready", (done) => {
        const spy = jasmine.createSpy("");
        service.getReady(MICROSOFT_PORTFOLIO.id).pipe(tap(spy)).subscribe((portfolio) => {
            expect(portfolio.reference).toEqual({
                id: MICROSOFT_PORTFOLIO.id,
                type: PortfolioType.Github,
                source: "https://github.com/Azure/BatchExplorer-data/tree/master",
            });
            done();
        });

        expect(spy).not.toHaveBeenCalled();
        service.get(MICROSOFT_PORTFOLIO.id).subscribe((x) => {
            resolvePortfolio.next(x);
            resolvePortfolio.complete();
        });
        expect(spy).toHaveBeenCalledOnce();
    });
});

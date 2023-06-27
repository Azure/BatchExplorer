import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ChartDirective, ChartType, ChartsModule, LoadingModule, TimeRange } from "@batch-flask/ui";
import { BatchAccountService, InsightsMetricsService, MonitorChartType, ThemeService } from "app/services";
import { DateTime } from "luxon";
import { BehaviorSubject, of } from "rxjs";
import { MonitorChartComponent } from "./monitor-chart.component";

const date1 = DateTime.local().minus({ hours: 1 }).toJSDate();
const date2 = new Date();
@Component({
    template: `
        <bl-monitor-chart [metrics]="metrics" [timeRange]="timeRange" [chartType]="chartType">
        </bl-monitor-chart>
    `,
})
class TestComponent {
    public metrics: MonitorChartType = MonitorChartType.CoreCount;
    public timeRange = new TimeRange({ start: new Date() });
    public chartType = ChartType.Line;
}

describe("MonitorChartComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let themeServiceSpy;
    let accountServiceSpy;
    let metricsServiceSpy;

    beforeEach(() => {
        themeServiceSpy = {
            currentTheme: new BehaviorSubject({
                monitorChart: {},
            }),
        };

        accountServiceSpy = {
            currentAccountId: new BehaviorSubject("acc-1"),
        };

        metricsServiceSpy = {
            getCoreMinutes: jasmine.createSpy("getCoreMinutes").and.returnValue(of({
                interval: "PT1H",
                metrics: [
                    {
                        name: "dedicated",
                        label: "Dedicated",
                        data: [
                            { timeStamp: date1, average: 10, total: 20 },
                            { timeStamp: date2, average: 20, total: 40 },
                        ],
                    },
                ],
            })),
            getFailedTask: jasmine.createSpy("getFailedTask").and.returnValue(of({
                interval: "PT2H",
                metrics: [
                    {
                        name: "taskFailed",
                        label: "Task failed events",
                        data: [
                            { timeStamp: date1, average: 5, total: 30 },
                            { timeStamp: date2, average: 10, total: 40 },
                        ],
                    },
                ],
            })),
        };
        TestBed.configureTestingModule({
            imports: [I18nTestingModule, ChartsModule, LoadingModule],
            declarations: [MonitorChartComponent, TestComponent],
            providers: [
                { provide: ThemeService, useValue: themeServiceSpy },
                { provide: BatchAccountService, useValue: accountServiceSpy },
                { provide: InsightsMetricsService, useValue: metricsServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-monitor-chart"));
        fixture.detectChanges();

    });

    function getChart(): ChartDirective {
        return de.query(By.directive(ChartDirective)).injector.get(ChartDirective);
    }

    it("should call the right metrics service method", () => {
        expect(metricsServiceSpy.getCoreMinutes).toHaveBeenCalledTimes(1);
        expect(metricsServiceSpy.getCoreMinutes).toHaveBeenCalledWith(testComponent.timeRange);
        expect(metricsServiceSpy.getFailedTask).not.toHaveBeenCalled();

        testComponent.metrics = MonitorChartType.FailedTask;
        fixture.detectChanges();
        expect(metricsServiceSpy.getCoreMinutes).toHaveBeenCalledTimes(1);
        expect(metricsServiceSpy.getFailedTask).toHaveBeenCalledTimes(1);
        expect(metricsServiceSpy.getFailedTask).toHaveBeenCalledWith(testComponent.timeRange);
    });

    it("refresh the data when account id is updated", () => {
        expect(metricsServiceSpy.getCoreMinutes).toHaveBeenCalledTimes(1);
        accountServiceSpy.currentAccountId.next("acc-2");
        expect(metricsServiceSpy.getCoreMinutes).toHaveBeenCalledTimes(2);
    });

    it("refresh the data when time range is  updated", () => {
        expect(metricsServiceSpy.getCoreMinutes).toHaveBeenCalledTimes(1);
        expect(metricsServiceSpy.getCoreMinutes).toHaveBeenCalledWith(testComponent.timeRange);

        testComponent.timeRange = new TimeRange({ start: new Date(2019, 1, 1) });
        fixture.detectChanges();
        expect(metricsServiceSpy.getCoreMinutes).toHaveBeenCalledTimes(2);
        expect(metricsServiceSpy.getCoreMinutes).toHaveBeenCalledWith(testComponent.timeRange);
    });

    it("shows aggregate interval return by the API", () => {
        expect(de.query(By.css(".interval-label")).nativeElement.textContent)
            .toContain("account-monitoring.aggregatedOver(interval:PT1H)");

        testComponent.metrics = MonitorChartType.FailedTask;
        fixture.detectChanges();

        expect(de.query(By.css(".interval-label")).nativeElement.textContent)
            .toContain("account-monitoring.aggregatedOver(interval:PT2H)");
    });

    it("shows summary of the charts with legend with the right aggregation", () => {
        let legendEls = de.queryAll(By.css(".legend .legend-item"));
        expect(legendEls.length).toEqual(1);
        expect(legendEls[0].nativeElement.textContent).toContain("Dedicated");
        expect(legendEls[0].nativeElement.textContent).toContain("15");
        expect(legendEls[0].nativeElement.textContent).not.toContain("Task failed events");

        testComponent.metrics = MonitorChartType.FailedTask;
        fixture.detectChanges();

        legendEls = de.queryAll(By.css(".legend .legend-item"));
        expect(legendEls.length).toEqual(1);
        expect(legendEls[0].nativeElement.textContent).toContain("Task failed events");
        expect(legendEls[0].nativeElement.textContent).toContain("70");
        expect(legendEls[0].nativeElement.textContent).not.toContain("Dedicated");
    });

    it("Creates the data sets corectly", () => {
        let chart = getChart();

        expect(chart.datasets).toEqual([
            {
                label: "Dedicated",
                data: [
                    { x: date1, y: 10 },
                    { x: date2, y: 20 },
                ],
                borderWidth: 1,
                fill: false,
            },
        ]);

        testComponent.metrics = MonitorChartType.FailedTask;
        fixture.detectChanges();
        chart = getChart();
        expect(chart.datasets).toEqual([
            {
                label: "Task failed events",
                data: [
                    { x: date1, y: 30 },
                    { x: date2, y: 40 },
                ],
                borderWidth: 1,
                fill: false,
            },
        ]);
    });
});

// tslint:disable:no-console
import * as fs from "fs";
import { setTimeout } from "timers";

const chromePerformance: any = performance;

if (process.env.DEBUG_MEM) {
    let initialValue = null;
    const stream = fs.createWriteStream("test.mem.csv");
    jasmine.getEnv().clearReporters();
    jasmine.getEnv().addReporter({
        suiteStarted: (result) => {
            if (initialValue === null) {
                initialValue = chromePerformance.memory.usedJSHeapSize;
            }
        },
        suiteDone: (result) => {
            const end = chromePerformance.memory.usedJSHeapSize;
            const out = Math.round(end / 1000);

            console.warn("Memory usage", `${out} kB`, result.fullName);
            stream.write(`${result.fullName},${out}\n`);
        },
        jasmineDone: () => {
            stream.end();
        },
    });
}

/**
 * TODO: override the default jasmine reporter to show results with timings like:
 * ActivatePackageDialogComponent
 *   √ Should show title and application id (865ms)
 *   √ Submit should call service and close the dialog (194ms)
 *   √ Submit should call service and show error if fails (929ms)
 */
if (process.env.DEBUG_TIME) {
    let timer = null;
    jasmine.getEnv().clearReporters();
    jasmine.getEnv().addReporter({
        specStarted: (result) => {
            timer = new Date().getTime();
        },
        specDone: (result) => {
            const ms = new Date().getTime() - timer;
            if (result.status !== "disabled") {
                console.warn(`${result.description}, executed in: ${ms}ms`);
            }
        },
    });
}

jasmine.getEnv().addReporter({
    jasmineDone: () => {
        console.log("Total memory is", chromePerformance.memory.usedJSHeapSize);

        setTimeout(() => {
            console.log("Total memory after 5s is", chromePerformance.memory.usedJSHeapSize);
        }, 5000);
    },
});

import { Injectable, OnDestroy } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { IpcPromiseEvent } from "@batch-flask/electron";
import { ipcMain } from "electron";
import { EventEmitter } from "events";
import { Subscription } from "rxjs";

const eventEmitter = new EventEmitter();

@Injectable()
export class BlIpcMain implements OnDestroy {

    /**
     * Listen to a send event sent by the remote from the renderer process
     *
     * @param {String} event event name.
     * @param {Function} listener listener function.
     */
    public on(event: string, listener: (...args) => Promise<any | undefined | null>): Subscription {
        // call from main process always.

        // add listener to common event emitter for main process.

        const func = (id, data, ipcEvent) => {
            listener(data, ipcEvent)
                .then((result) => {
                    eventEmitter.emit(this._getSuccessEventName(event, id), result);
                })
                .catch((error) => {
                    eventEmitter.emit(this._getFailureEventName(event, id), { ...error });
                });
        };
        eventEmitter.on(event, func);
        return new Subscription(() => {
            eventEmitter.removeListener(event, func);
        });
    }

    public init() {
        ipcMain.on(IpcPromiseEvent.request, this._rendererEventHandler);
    }

    public ngOnDestroy() {
        ipcMain.removeListener(IpcPromiseEvent.request, this._rendererEventHandler);
    }

    // Temporary event name for success
    private _getSuccessEventName(eventName, id) {
        return eventName + id.toString() + IpcPromiseEvent.successSuffix;
    }

    //  event name for success
    private _getFailureEventName(eventName, id) {
        return eventName + id.toString() + IpcPromiseEvent.failureSuffix;
    }

    /**
     * common event handler for ipc.
     *
     * @param {Event} event event object.
     * @param {Object} arg argument object.
     */
    @autobind()
    private _rendererEventHandler(event, arg) {
        // NOTE: send from renderer process always.
        const successEventName = this._getSuccessEventName(arg.eventName, arg.id);
        const failureEventName = this._getFailureEventName(arg.eventName, arg.id);

        const onSuccess = (result) => {
            // send success to ipc for renderer process.
            event.sender.send(IpcPromiseEvent.responseSuccess, {
                data: result,
                eventName: arg.eventName,
                id: arg.id,
            });
            eventEmitter.removeListener(successEventName, onSuccess);
            eventEmitter.removeListener(failureEventName, onFailure);
        };
        const onFailure = (result) => {
            // send failure to ipc for renderer process.
            event.sender.send(IpcPromiseEvent.responseFailure, {
                data: result,
                eventName: arg.eventName,
                id: arg.id,
            });
            eventEmitter.removeListener(successEventName, onSuccess);
            eventEmitter.removeListener(failureEventName, onFailure);
        };

        // add listener to common event emitter for main process.
        eventEmitter.on(successEventName, onSuccess);
        eventEmitter.on(failureEventName, onFailure);

        // emit to common event emitter for main process.
        eventEmitter.emit(arg.eventName, arg.id, arg.data, event);
    }
}

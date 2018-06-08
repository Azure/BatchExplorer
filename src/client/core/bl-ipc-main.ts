import { IpcPromiseEvent } from "@batch-flask/ui/electron";
import { ipcMain } from "electron";
import { EventEmitter } from "events";

const eventEmitter = new EventEmitter();

export class BlIpcMain {

    /**
     * Listen to a send event sent by the remote from the renderer process
     *
     * @param {String} event event name.
     * @param {Function} listener listener function.
     */
    public static on(event: string, listener: (...args) => Promise<any>) {
        // call from main process always.

        // add listener to common event emitter for main process.
        eventEmitter.on(event, (id, data, ipcEvent) => {
            listener(data, ipcEvent)
                .then((result) => {
                    eventEmitter.emit(this._getSuccessEventName(event, id), result);
                })
                .catch((error) => {
                    eventEmitter.emit(this._getFailureEventName(event, id), {...error});
                });
        });
    }

    public static init() {
        ipcMain.on(IpcPromiseEvent.request, this._rendererEventHandler.bind(this));
    }

    // Temporary event name for success
    private static _getSuccessEventName(eventName, id) {
        return eventName + id.toString() + IpcPromiseEvent.successSuffix;
    }

    // Temporary event name for success
    private static _getFailureEventName(eventName, id) {
        return eventName + id.toString() + IpcPromiseEvent.failureSuffix;
    }

    /**
     * common event handler for ipc.
     *
     * @param {Event} event event object.
     * @param {Object} arg argument object.
     */
    private static _rendererEventHandler(event, arg) {
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

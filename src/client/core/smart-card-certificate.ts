import { app, dialog } from "electron";

export function listenToSelectCertifcateEvent() {
    app.on("select-client-certificate", (
        event: Event,
        webcontents: Electron.WebContents,
        url: string,
        certificates: Electron.Certificate[],
        callback: (certificate: Electron.Certificate) => void) => {

        if (certificates.length <= 1) {
            // Default behavior is appropriate
            return false;
        }
        event.preventDefault();
        const picked = dialog.showMessageBox({
            message: "Pick certificate",
            buttons: certificates.map(x => x.issuerName),
        });

        callback(certificates[picked]);
    });
}

import { remote } from "electron";
const storageClient = (<any> remote.getCurrentWindow()).storageClient;

export default storageClient;

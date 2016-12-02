import { remote } from "electron";
const batchClient = (<any> remote.getCurrentWindow()).batchClient;

export default batchClient;

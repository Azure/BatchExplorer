// tslint:disable:variable-name
import { Constants as CommonConstants } from "common";
import { remote } from "electron";

const Client = (remote.getCurrentWindow() as any).clientConstants;
const Constants = { ...CommonConstants, Client };
export { Constants };

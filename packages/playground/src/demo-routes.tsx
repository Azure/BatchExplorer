import * as React from "react";
import { ButtonDemo } from "./demo/form/button/button-demo";
import { ComboBoxDemo } from "./demo/form/combobox/combobox-demo";
import { SearchBoxDemo } from "./demo/form/searchbox/searchbox-demo";
import { TextFieldDemo } from "./demo/form/textfield/textfield-demo";
import { CertificateDisplayDemo } from "./demo/display/certificate/certificate-display-demo";
import { ActionFormDemo } from "./demo/form/action-form-demo";
import { DropdownDemo } from "./demo/form/dropdown-demo";
import { RadioButtonDemo } from "./demo/form/radiobutton/radiobutton-demo";
import { CheckboxDemo } from "./demo/form/checkbox/checkbox-demo";
import { NotificationDemo } from "./demo/form/notification-demo";
import { DataGridLoadMoreDemo } from "./demo/display/task-grid/task-data-grid";
import { TabSelectorDemo } from "./demo/form/tab-selector-demo";
import { StringListDemo } from "./demo/form/stringlist/stringlist-demo";
import { VmExtensionListDemo } from "./demo/display/vm-extension/vm-extension-list-demo";
import { TaskListDemo } from "./demo/display/task-list/task-list-demo";

export const DEMO_MAP = {
    default: () => <DefaultPane />,
    actionform: () => <ActionFormDemo />,
    button: () => <ButtonDemo />,
    checkbox: () => <CheckboxDemo />,
    radiobutton: () => <RadioButtonDemo />,
    combobox: () => <ComboBoxDemo />,
    dropdown: () => <DropdownDemo />,
    searchbox: () => <SearchBoxDemo />,
    tabselector: () => <TabSelectorDemo />,
    textfield: () => <TextFieldDemo />,
    notification: () => <NotificationDemo />,
    certificatedisplay: () => <CertificateDisplayDemo />,
    dataGridLoadMore: () => <DataGridLoadMoreDemo />,
    stringlist: () => <StringListDemo />,
    vmExtensionList: () => <VmExtensionListDemo />,
    taskList: () => <TaskListDemo />,
};

export type DemoName = keyof typeof DEMO_MAP;

const DEMO_HASH_REGEX = /#\/demos\/(?<demo>\w+)/;

export function getDemoHash(demoName: DemoName) {
    return `#/demos/${demoName}`;
}

export function getDemoFromUrl(): DemoName {
    let demoName: DemoName = "default";
    if (location.hash) {
        const match = location.hash.match(DEMO_HASH_REGEX);
        if (match) {
            const d = match.groups?.demo as DemoName | undefined;
            if (d && DEMO_MAP[d]) {
                demoName = d;
            }
        }
    }
    return demoName;
}

export const DefaultPane: React.FC = () => {
    return (
        <span style={{ width: "100%", textAlign: "center" }}>
            Select a demo from the list
        </span>
    );
};

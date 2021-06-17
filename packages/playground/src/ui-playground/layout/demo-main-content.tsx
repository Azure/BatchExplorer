import * as React from "react";
import { Route, Switch } from "react-router";
import { ButtonDemo } from "../demo/generic/button/button-demo";
import { ComboBox } from "../generic/combobox";
import { Dropdown } from "../generic/dropdown";
import { Graph } from "../generic/graph";
import { SearchBox } from "../generic/searchbox";
import { GalleryApplication } from "../batch/galleryapplication";
import { Quota } from "../batch/quota";
import { Resources } from "../batch/resources";
import { Tab } from "../batch/tab";
import { Toolbar } from "../batch/toolbar";
import { Configuration } from "../displays/configuration";
import { CreateItem } from "../displays/createitem";
import { File } from "../displays/file";
import { JobSpecification } from "../displays/jobspecification";
import { Nodes } from "../displays/nodes";
import { Packages } from "../displays/packages";
import { PoolGraph } from "../displays/poolgraph";
import { Tasks } from "../displays/tasks";
import { TextField } from "../generic/textfield";
import { CheckboxDemo } from "../demo/generic/checkbox/checkbox-demo";

export const DemoMainContent: React.FC = () => {
    return (
        <Switch>
            <Route path="/button">
                <ButtonDemo />
            </Route>
            <Route path="/checkbox">
                <CheckboxDemo />
            </Route>
            <Route path="/combobox">
                <ComboBox />
            </Route>
            <Route path="/dropdown">
                <Dropdown />
            </Route>
            <Route path="/graph">
                <Graph />
            </Route>
            <Route path="/searchbox">
                <SearchBox />
            </Route>
            <Route path="/textfield">
                <TextField />
            </Route>
            <Route path="/galleryapplication">
                <GalleryApplication />
            </Route>
            <Route path="/quota">
                <Quota />
            </Route>
            <Route path="/resources">
                <Resources />
            </Route>
            <Route path="/tab">
                <Tab />
            </Route>
            <Route path="/toolbar">
                <Toolbar />
            </Route>
            <Route path="/configuration">
                <Configuration />
            </Route>
            <Route path="/createitem">
                <CreateItem />
            </Route>
            <Route path="/file">
                <File />
            </Route>
            <Route path="/poolgraph">
                <PoolGraph />
            </Route>
            <Route path="/jobspecification">
                <JobSpecification />
            </Route>
            <Route path="/nodes">
                <Nodes />
            </Route>
            <Route path="/packages">
                <Packages />
            </Route>
            <Route path="/tasks">
                <Tasks />
            </Route>
        </Switch>
    );
};

import * as React from "react";
//import { Nav, INavStyles, INavLinkGroup } from "@fluentui/react/lib/Nav";
import { Button } from "./generic/button";
import { Checkbox } from "./generic/checkbox";
import { ComboBox } from "./generic/combobox";
import { Dropdown } from "./generic/dropdown";
import { Graph } from "./generic/graph";
import { SearchBox } from "./generic/searchbox";
import { TextField } from "./generic/textfield";

import { GalleryApplication } from "./batch/galleryapplication";
import { Quota } from "./batch/quota";
import { Resources } from "./batch/resources";
import { Tab } from "./batch/tab";
import { Toolbar } from "./batch/toolbar";

import { Configuration } from "./displays/configuration";
import { CreateItem } from "./displays/createitem";
import { File } from "./displays/file";
import { PoolGraph } from "./displays/poolgraph";
import { JobSpecification } from "./displays/jobspecification";
import { Nodes } from "./displays/nodes";
import { Packages } from "./displays/packages";
import { Tasks } from "./displays/tasks";

//import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { DefaultButton } from "@fluentui/react/lib/Button";
//import { Label } from "@fluentui/react/lib/Label";
import { categoryStyle, linkStyle } from "./style";

export interface PlaygroundExampleProps {
    /**
     * Text to display
     */
    text?: string;
}

/**
 * Example component
 */
export const PlaygroundExample: React.FC<PlaygroundExampleProps> = () => {
    //return <span className="be-example-simple">{props.text ?? myHeading}</span>;

    return (
        <div className="hi">
            <h1
                style={{
                    fontSize: "2em",
                    margin: 0,
                    padding: 0,
                    fontWeight: 600,
                    lineHeight: 4,
                    userSelect: "none",
                    textAlign: "center",
                }}
            >
                Shared Component Library Playground
            </h1>

            <Router>
                <div style={{ display: "flex" }}>
                    <div
                        style={{
                            padding: "2px",
                            width: "20%", //distance between "sidebar" and the actual elements being displayed
                            //background: "#f0f0f0",
                        }}
                    >
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                            <li>
                                <h2 style={categoryStyle}>
                                    Generic Components
                                </h2>
                            </li>
                            <li>
                                <Link to="/button">
                                    <DefaultButton
                                        text="Button"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/checkbox">
                                    <DefaultButton
                                        text="Checkbox"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/combobox">
                                    <DefaultButton
                                        text="ComboBox"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/dropdown">
                                    <DefaultButton
                                        text="Dropdown"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/graph">
                                    <DefaultButton
                                        text="Graph"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/searchbox">
                                    <DefaultButton
                                        text="SearchBox"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/textfield">
                                    <DefaultButton
                                        text="TextField"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <br></br>
                            <li>
                                <h2 style={categoryStyle}>Batch Components</h2>
                            </li>
                            <li>
                                <Link to="/galleryapplication">
                                    <DefaultButton
                                        text="Gallery Application"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/quota">
                                    <DefaultButton
                                        text="Quota"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/resources">
                                    <DefaultButton
                                        text="Resources"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/tab">
                                    <DefaultButton
                                        text="Tab"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/toolbar">
                                    <DefaultButton
                                        text="Toolbar"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <h2 style={categoryStyle}>Displays</h2>
                            </li>
                            <li>
                                <Link to="/configuration">
                                    <DefaultButton
                                        text="Configuration"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/createitem">
                                    <DefaultButton
                                        text="Create Item"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/file">
                                    <DefaultButton
                                        text="File"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/poolgraph">
                                    <DefaultButton
                                        text="Pool Graph"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/jobspecification">
                                    <DefaultButton
                                        text="Job Specification"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/nodes">
                                    <DefaultButton
                                        text="Nodes"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/packages">
                                    <DefaultButton
                                        text="Packages"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                            <li>
                                <Link to="/tasks">
                                    <DefaultButton
                                        text="Tasks"
                                        style={linkStyle}
                                    ></DefaultButton>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div style={{ flex: 1, padding: "10px" }}>
                        <Switch>
                            <Route path="/button">
                                <Button />
                            </Route>
                            <Route path="/checkbox">
                                <Checkbox />
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
                    </div>
                </div>
            </Router>
        </div>
    );
};

import * as React from "react";
import type { MonacoEditorImplProps } from "./impl/MonacoEditorImpl";
import { MonacoWrapper } from "./impl/MonacoWrapper";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MonacoEditorProps extends MonacoEditorImplProps {}

/**
 * A component which wraps the Monaco editor.
 *
 * Note that this component does not try to abstract away Monaco, but simply
 * makes it easier to use with React.
 *
 * **IMPORTANT**
 * When using the monaco APIs to interact with this component, make sure
 * to import the editor API types like this:
 *
 *     import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
 *
 * This will prevent bundlers (or webpack at least) from pulling in all of
 * Monaco (which is huge) in the main bundle.
 */
export const MonacoEditor: React.FC<MonacoEditorProps> = MonacoWrapper;

export type { EditorController } from "./impl/MonacoEditorImpl";

import * as React from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import {debounce, DebouncedFunction} from "@batch/ui-common"

const defaultOnChangeDelay = 200;

export interface MonacoEditorImplProps {
    /**
     * The contents of the editor.
     * NOTE: Changing this will recreate the editor
     */
    value?: string | null;

    /**
     * The language of the editor.
     * NOTE: Changing this will recreate the editor
     */
    language?: string;

    /**
     * Various monaco editor options.
     * NOTE: Changing this will recreate the editor
     */
    editorOptions?: monaco.editor.IEditorOptions;

    /**
     * The theme of the editor.
     * NOTE: Changing this will recreate the editor
     */
    theme?: string;

    /**
     * Styles applied to the <div> element which contains the editor
     */
    containerStyle?: React.CSSProperties;

    /**
     * Number of milliseconds to wait for more user input before firing an
     * onChange event.
     */
    onChangeDelay?: number;

    /**
     * Maximum number of milliseconds to wait before firing an onChange event.
     * If not specified, changes will be delayed until user input slows enough.
     */
     onChangeMaxWait?: number;

    /**
     * Callback for when the text contents of the editor changes. Change events
     * are debounced automatically. When onBlur is called, onChange is called
     * immediately (ignoring debouncing).
     */
    onChange?: (value: string) => void;

    /**
     * Immediate callback when the text content of the editor changes
     */
    onImmediateChange?: (value: string) => void;

    /**
     * Callback for when the editor is created (note this may be called
     * when certain properties change)
     */
    onCreate?: (editor: monaco.editor.IStandaloneCodeEditor) => void;

    /**
     * A reference to the editor's model object.
     * NOTE: Changing this will recreate the editor
     */
    controllerRef?: React.MutableRefObject<EditorController | undefined>;
}

/**
 * An object which can be used to control the monaco editor without
 * directly importing the monaco namespace (which can cause webpack to
 * include all of Monaco in the current bundle)
 */
export class EditorController {
    model: monaco.editor.ITextModel;

    constructor(model: monaco.editor.ITextModel) {
        this.model = model;
    }

    setLanguage(language: string): void {
        monaco.editor.setModelLanguage(this.model, language);
    }
}

/**
 * A component which wraps the Monaco editor.
 *
 * Note that this component does not try to abstract away Monaco, but simply
 * makes it easier to use with React.
 */
export const MonacoEditor: React.FC<MonacoEditorImplProps> = (props) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    let controllerRef = React.useRef<EditorController>();
    if (props.controllerRef) {
        controllerRef = props.controllerRef;
    }

    const { value = "" } = props;

    React.useEffect(() => {
        let editor: monaco.editor.IStandaloneCodeEditor | undefined;
        let onWindowResize: ((event: UIEvent) => void) | undefined;

        if (containerRef.current) {
            // Create the editor
            if (!controllerRef.current) {
                controllerRef.current = new EditorController(
                    monaco.editor.createModel(value ?? "", props.language)
                );
            }

            const model = controllerRef.current.model;

            editor = _createEditor(model, props, containerRef.current);
            onWindowResize = () => {
                if (editor) {
                    editor.layout();
                }
            };
            window.addEventListener("resize", onWindowResize);
        }

        return () => {
            if (onWindowResize) {
                window.removeEventListener("resize", onWindowResize);
            }
            if (editor) {
                _destroyEditor(editor);
            }
        };
    }, [props, containerRef, controllerRef, value]);

    return (
        <div
            data-testid="monaco-container"
            ref={containerRef}
            style={props.containerStyle}
        />
    );
};

function _createEditor(
    model: monaco.editor.ITextModel,
    props: MonacoEditorImplProps,
    containerEl: HTMLElement
): monaco.editor.IStandaloneCodeEditor {
    const editor = monaco.editor.create(containerEl, {
        theme: props.theme,
        ...(props.editorOptions || {}),
        model,
    });

    let debouncedOnChange: DebouncedFunction<() => void> | undefined;
    if (props.onChange) {
        debouncedOnChange = debounce(() => {
            if (props.onChange) {
                props.onChange(model.getValue());
            }
        }, props.onChangeDelay ?? defaultOnChangeDelay, {
            maxWait: props.onChangeMaxWait
        });
    }

    if (props.onCreate) {
        props.onCreate(editor);
    }

    editor.onDidChangeModelContent(() => {
        if (props.onImmediateChange) {
            props.onImmediateChange(model.getValue());
        }
        if (debouncedOnChange) {
            debouncedOnChange();
        }
    });

    editor.onDidBlurEditorText(() => {
        if (debouncedOnChange) {
            // Make sure to call onChange with the most recent value
            debouncedOnChange.flush();
        }
    });

    return editor;
}

function _destroyEditor(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.dispose();
}

export default MonacoEditor;

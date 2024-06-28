"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskList = void 0;
var react_1 = require("react");
var ci_1 = require("react-icons/ci");
var data_grid_1 = require("@azure/bonito-ui/lib/components/data-grid");
var environment_1 = require("@azure/bonito-core/lib/environment");
var environment_2 = require("@batch/ui-service/lib/environment");
var TaskList = function (props) {
    var accountEndpoint = props.accountEndpoint, jobId = props.jobId, numOfTasks = props.numOfTasks;
    var isCompact = react_1.default.useState(false)[0];
    var _a = react_1.default.useState([]), items = _a[0], setItems = _a[1];
    react_1.default.useEffect(function () {
        var isMounted = true;
        var taskService = (0, environment_1.inject)(environment_2.BatchDependencyName.TaskService);
        var fetchTaskList = function () { return __awaiter(void 0, void 0, void 0, function () {
            var tasks, auxList, _a, tasks_1, tasks_1_1, task, e_1_1;
            var _b, e_1, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!isMounted)
                            return [2 /*return*/];
                        return [4 /*yield*/, taskService.listTasks(accountEndpoint, jobId)];
                    case 1:
                        tasks = _e.sent();
                        auxList = [];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 7, 8, 13]);
                        _a = true, tasks_1 = __asyncValues(tasks);
                        _e.label = 3;
                    case 3: return [4 /*yield*/, tasks_1.next()];
                    case 4:
                        if (!(tasks_1_1 = _e.sent(), _b = tasks_1_1.done, !_b)) return [3 /*break*/, 6];
                        _d = tasks_1_1.value;
                        _a = false;
                        task = _d;
                        auxList.push(task);
                        _e.label = 5;
                    case 5:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _e.trys.push([8, , 11, 12]);
                        if (!(!_a && !_b && (_c = tasks_1.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _c.call(tasks_1)];
                    case 9:
                        _e.sent();
                        _e.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        setItems(auxList);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchTaskList().catch(function (e) {
            console.log("Error: ", e);
        });
        return function () {
            isMounted = false;
        };
    }, [accountEndpoint, jobId, numOfTasks]);
    return (<>
            <data_grid_1.DataGrid compact={isCompact} items={items} columns={columns}/>
        </>);
};
exports.TaskList = TaskList;
var columns = [
    {
        label: "Url",
        prop: "url",
        minWidth: 100,
        maxWidth: 150,
    },
    {
        label: "Name",
        prop: "id",
        minWidth: 100,
        maxWidth: 150,
        onRender: function (task) {
            return <a href={task.url}>{task.id}</a>;
        },
    },
    {
        label: "State",
        prop: "state",
        minWidth: 150,
        maxWidth: 200,
        onRender: function (task) {
            return (<div>
                    {task.state == "completed" ? (<ci_1.CiCircleCheck />) : (<ci_1.CiClock1 />)}
                    {task.state}
                </div>);
        },
    },
    {
        label: "ExecutionInfo",
        prop: "executioninfo",
        minWidth: 150,
        onRender: function (task) {
            return (<div>
                    Retry count: {task.executionInfo.retryCount} {"\n"}
                    Requeue count: {task.executionInfo.requeueCount}
                </div>);
        },
    },
];

import { Record } from "immutable";

export const fakeRecord = Record({
    id: null,
    state: null,
    name: null,
});

export class FakeModel extends fakeRecord {
    public id: string;
    public state: string;
    public name: string;
}

const mock = {
    prompt: jest.fn(() => {
        return {
            path1: "/some/path",
            path2: "/another/path",
        };
    }),
};

export default mock;

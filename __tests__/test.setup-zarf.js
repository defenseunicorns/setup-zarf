const os = require("os");
const setup = require("../lib/setup-zarf.js");

test("Map for runner architecture", () => {
    expect(setup.mapArch("x64")).toBe("amd64")
});

test("Map for macOS operating system", () => {
    expect(setup.mapOS("darwin")).toBe("Darwin")
});

test("Map for linux operating system", () => {
    expect(setup.mapOS("linux")).toBe("Linux")
});

test("Map for windows operating system", () => {
    expect(setup.mapOS("win32")).toBe("Windows")
});
import { expect, test } from "@jest/globals";

import { mapArch, mapOS } from "../src/setup-zarf";

test("Map for runner architecture", () => {
    expect(mapArch()).toBe("amd64")
});

test("Map for macOS operating system", () => {
    expect(mapOS().macMap).toBe("Darwin")
});

test("Map for linux operating system", () => {
    expect(mapOS().linuxMap).toBe("Linux")
});

test("Map for windows operating system", () => {
    expect(mapOS().windowsMap).toBe("Windows")
});
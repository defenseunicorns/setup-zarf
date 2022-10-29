import os from "os";
import { mapArch, mapOS, setInstallPath, setZarfBinaryUrl  } from "../lib/setup-zarf";

test("Map for runner architecture", () => {
    expect(mapArch("x64")).toBe("amd64")
});

test("Map for macOS operating system", () => {
    expect(mapOS("darwin")).toBe("Darwin")
});

test("Map for linux operating system", () => {
    expect(mapOS("linux")).toBe("Linux")
});

test("Map for Windows operating system", () => {
    expect(mapOS("win32")).toBe("Windows")
});

test("Install path for macOS zarf binary", () => {
    expect(setInstallPath("/Users/runner")).toBe("/Users/runner/.zarf/bin/zarf");
});

test("Install path for linux zarf binary", () => {
    expect(setInstallPath("/home/runner")).toBe("/home/runner/.zarf/bin/zarf");
});

test("Install path for windows zarf binary", () => {
    if (os.platform() === "win32") {
        expect(setInstallPath("C:\\Users\\runneradmin")).toBe("C:\\Users\\runneradmin\\.zarf\\bin\\zarf.exe");
    }
});

test("Zarf binary download url for macOS amd64", () => {
    expect(setZarfBinaryUrl("amd64", "darwin", "v0.22.2")).toBe("https://github.com/defenseunicorns/zarf/releases/download/v0.22.2/zarf_v0.22.2_Darwin_amd64");
});

test("Zarf binary download url for linux amd64", () => {
    expect(setZarfBinaryUrl("amd64", "Linux", "v0.22.2")).toBe("https://github.com/defenseunicorns/zarf/releases/download/v0.22.2/zarf_v0.22.2_Linux_amd64");
});

test("Zarf binary download url for windows amd64", () => {
    expect(setZarfBinaryUrl("amd64", "win32", "v0.22.2")).toBe("https://github.com/defenseunicorns/zarf/releases/download/v0.22.2/zarf_v0.22.2_Windows_amd64.exe");
});

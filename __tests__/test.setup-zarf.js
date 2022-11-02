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

test("Install path for macOS zarf binary", () => {
    if (os.platform() === "darwin") {
        expect(setup.setBinaryInstallPath("/Users/runner")).toBe("/Users/runner/.zarf/bin/zarf");
    }
});

test("Install path for linux zarf binary", () => {
    if (os.platform() === "linux") {
        expect(setup.setBinaryInstallPath("/home/runner")).toBe("/home/runner/.zarf/bin/zarf");
    }
});

test("Install path for windows zarf binary", () => {
    if (os.platform() === "win32") {
        expect(setup.setBinaryInstallPath("C:\\Users\\runneradmin")).toBe("C:\\Users\\runneradmin\\.zarf\\bin\\zarf.exe");
    }
});

test("Name of zarf init package", () => {
    expect(setup.setInitPackageInstallPath("amd64", "/home/runner", "v0.22.2").tarball).toBe("zarf-init-amd64-v0.22.2.tar.zst")
})

test("Install path for macOS zarf init package", () => {
    if (os.platform() === "darwin") {
        expect(setup.setInitPackageInstallPath("amd64", "/Users/runner", "v0.22.2").initPackagePath).toBe("/Users/runner/.zarf/zarf-init-amd64-v0.22.2.tar.zst")
    }
})

test("Install path for linux zarf init package", () => {
    if (os.platform() === "linux") {
        expect(setup.setInitPackageInstallPath("amd64", "/home/runner", "v0.22.2").initPackagePath).toBe("/home/runner/.zarf/zarf-init-amd64-v0.22.2.tar.zst")
    }
})

test("Install path for windows zarf init package", () => {
    if (os.platform() === "win32") {
        expect(setup.setInitPackageInstallPath("amd64", "C:\\Users\\runneradmin", "v0.22.2").initPackagePath).toBe("C:\\Users\\runneradmin\\.zarf\\zarf-init-amd64-v0.22.2.tar.zst")
    }
})

test("Zarf binary download url for macOS amd64", () => {
    expect(setup.setZarfBinaryUrl("amd64", "darwin", "v0.22.2")).toBe("https://github.com/defenseunicorns/zarf/releases/download/v0.22.2/zarf_v0.22.2_Darwin_amd64");
});

test("Zarf binary download url for linux amd64", () => {
    expect(setup.setZarfBinaryUrl("amd64", "Linux", "v0.22.2")).toBe("https://github.com/defenseunicorns/zarf/releases/download/v0.22.2/zarf_v0.22.2_Linux_amd64");
});

test("Zarf binary download url for windows amd64", () => {
    expect(setup.setZarfBinaryUrl("amd64", "win32", "v0.22.2")).toBe("https://github.com/defenseunicorns/zarf/releases/download/v0.22.2/zarf_v0.22.2_Windows_amd64.exe");
});

const core = require("@actions/core");
const io = require("@actions/io");
const tc = require("@actions/tool-cache");
const fs = require("fs");
const os = require("os");
const path = require("path");

function mapArch(arch) {
  const mappings = {
    x64: "amd64"
  };
  return mappings[arch] || arch;
}

function mapOS(os) {
  const mappings = {
    darwin: "Darwin",
    linux: "Linux",
    win32: "Windows"
  };
  return mappings[os] || os;
}

async function setupZarf() {
  try {
    // Get user input
    const version = core.getInput("version");
    const downloadInitPackage = core.getBooleanInput("download-init-package");
    
    // Download init package
    if (downloadInitPackage === true) {
      const tarball = `zarf-init-${ mapArch(os.arch) }-${ version }.tar.zst`;
      const initPackagePath = path.join(os.homedir, ".zarf", tarball);
      const initPackageURL = `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ tarball }`;
      const pathToInitPackage = await tc.downloadTool(initPackageURL, initPackagePath);
      await io.cp(pathToInitPackage, process.cwd());
    }

    // Download zarf binary
    const exeSuffix = os.platform.startsWith("win") ? ".exe" : "";
    const filename = `zarf_${ version }_${ mapOS(os.platform) }_${ mapArch(os.arch) }${ exeSuffix }`;
    const binaryURL = `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ filename }`;
    const binPath = os.platform().startsWith("win") ? ".zarf\\bin\\zarf.exe" : ".zarf/bin/zarf";
    const installPath = path.join(os.homedir, binPath);
    const zarfBinary = await tc.downloadTool(binaryURL, installPath);

    // Add read/write/execute permissions to binary
    fs.chmodSync(zarfBinary, "700");
    
    // Cache the zarf binary
    const binaryFile = os.platform().startsWith("win") ? "zarf.exe" : "zarf";
    const toolName = "zarf";
    const binCachedPath = await tc.cacheFile(zarfBinary, binaryFile, toolName, version);

    // Add binary to the $PATH
    core.addPath(binCachedPath);
    
    core.info("Zarf has been successfully installed/configured and is ready to use!");

  } catch(error) {
      core.setFailed(error.message);
  }
}

module.exports = {
  mapArch,
  mapOS,
  setupZarf
};
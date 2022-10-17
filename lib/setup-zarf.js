// External packages
const core = require("@actions/core");
const io = require("@actions/io");
const tc = require("@actions/tool-cache");

// Node.js core packages
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

async function getZarfBinary(version) {
  // If we're on Windows, then the executable ends with .exe
  const exeSuffix = os.platform().startsWith("win") ? ".exe" : "";

  const platform = os.platform();
  const arch = os.arch();

  const filename = `zarf_v${ version }_${ mapOS(platform) }_${ mapArch(arch) }${ exeSuffix }`;
  const binaryURL = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ filename }`;

  // Set the path where the zarf binary will be installed
  const homeDirectory = os.homedir();
  const binPath = os.platform().startsWith("win") ? ".zarf\\bin\\zarf.exe" : ".zarf/bin/zarf";
  const installPath = path.join(homeDirectory, binPath);
  core.info(`Zarf version v${ version } will be installed at ${ installPath }`);

  // Download the zarf binary
  core.info(`Downloading the zarf binary from ${ binaryURL }...`);
  const pathToBinary = await tc.downloadTool(binaryURL, installPath);
  core.info(`Successfully downloaded ${ binaryURL }`);
  core.info(`The zarf binary is at ${ pathToBinary }`);

  return {
    pathToBinary
  };
}

async function addPermissions(version) {
  core.info("Adding read/write/execute permissions to the zarf binary...");

  const zarfBinary = getZarfBinary(version).pathToBinary;

  fs.chmodSync(zarfBinary, "700");
}

async function getZarfInitPackage(version, initPackage) {
  const arch = os.arch();
  const tarball = `zarf-init-${ mapArch(arch) }-v${ version }.tar.zst`;
  const initPackageURL = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ tarball }`;

  // Set the path where the zarf init package will be installed
  const homeDirectory = os.homedir();
  const initPackagePath = path.join(homeDirectory, ".zarf", tarball);
  core.info(`The zarf init package ${ tarball } will be installed at ${ initPackagePath }`);

  // Download the zarf init package
  let initPath = "";
  if (initPackage == "true") {
    core.info(`Downloading the zarf init package from ${ initPackageURL }...`);
    initPath = await tc.downloadTool(initPackageURL, initPackagePath);
    core.info(`Successfully downloaded ${ initPackageURL }`);
  }
  const pathToInitPackage = initPath;
  core.info(`The zarf init package is at ${ pathToInitPackage }`);

  // Copy the init package to the current working directory
  core.info(`Copying the zarf init package from ${ pathToInitPackage } to ${ process.cwd() }...`);
  await io.cp(pathToInitPackage, process.cwd());
}

async function setupZarf() {
  try {
    // Get version of zarf from user input
    const version = core.getInput("version");

    // Get whether we will download an init package from user input
    const initPackage = core.getInput("initPackage");

    // Get the zarf binary
    getZarfBinary(version);

    // Get the zarf init package
    getZarfInitPackage(version, initPackage);

    // Add read/write/execute permissions to the zarf binary
    addPermissions();

    // Cache the zarf binary
    const zarfBinary = getZarfBinary(version).pathToBinary;
    core.info("Caching the zarf binary...");
    const binaryFile = os.platform().startsWith("win") ? "zarf.exe" : "zarf";
    const toolName = "zarf";
    const binCachedPath = await tc.cacheFile(zarfBinary, binaryFile, toolName, version);
    core.info(`Cached the zarf binary at ${ binCachedPath }`);

    // Expose the zarf binary by adding it to the $PATH environment variable
    core.info(`Adding ${ binCachedPath } to the $PATH...`);
    core.addPath(binCachedPath);
    
    // Zarf is ready for use
    core.info("Zarf has been successfully installed/configured and is ready to use!");

  } catch(error) {
      core.setFailed(error.message);
  }
}

module.exports = setupZarf();

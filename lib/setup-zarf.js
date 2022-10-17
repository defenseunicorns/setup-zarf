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

function getZarfBinary(version) {
  // If we're on Windows, then the executable ends with .exe
  const exeSuffix = os.platform().startsWith("win") ? ".exe" : "";

  const platform = os.platform();
  const arch = os.arch();

  const filename = `zarf_v${ version }_${ mapOS(platform) }_${ mapArch(arch) }${ exeSuffix }`;
  const binaryURL = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ filename }`;

  return {
    binaryURL
  };
}

function getZarfInitPackage(version) {
  const arch = os.arch();
  const tarball = `zarf-init-${ mapArch(arch) }-v${ version }.tar.zst`;
  const initPackageURL = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ tarball }`;

  return {
    initPackageURL,
    tarball
  };
}

async function setupZarf() {
  try {
    // Get version of zarf from user input
    const version = core.getInput("version");

    // Get whether we will download an init package from user input
    const initPackage = core.getInput("initPackage");

    // Set the path where the zarf binary will be installed
    const homeDirectory = os.homedir();
    const binPath = os.platform().startsWith("win") ? ".zarf\\bin\\zarf.exe" : ".zarf/bin/zarf";
    const installPath = path.join(homeDirectory, binPath);
    core.info(`Zarf version v${ version } will be installed at ${ installPath }`);

    // Set the path where the zarf init package will be installed
    const initPackageTarball = getZarfInitPackage(version).tarball;
    const initPackagePath = path.join(homeDirectory, ".zarf", initPackageTarball);
    core.info(`The zarf init package ${ initPackageTarball } will be installed at ${ initPackagePath }`);

    // Download the zarf binary
    const zarfbinaryURL = getZarfBinary(version).binaryURL;
    core.info(`Downloading the zarf binary from ${ zarfbinaryURL }...`);
    const pathToBinary = await tc.downloadTool(zarfbinaryURL, installPath);
    core.info(`Successfully downloaded ${ zarfbinaryURL }`);
    core.info(`The zarf binary is at ${ pathToBinary }`);

    // Download the zarf init package
    let initPath = "";
    if (initPackage == "true") {
      const zarfInitPackageURL = getZarfInitPackage(version).initPackageURL;
      core.info(`Downloading the zarf init package from ${ zarfInitPackageURL }...`);
      initPath = await tc.downloadTool(zarfInitPackageURL, initPackagePath);
      core.info(`Successfully downloaded ${ zarfInitPackageURL }`);
    }
    const pathToInitPackage = initPath;
    core.info(`The zarf init package is at ${ pathToInitPackage }`);

    // Move the init package to the current working directory
    await io.cp(pathToInitPackage, process.cwd());

    // Add read/write/execute permissions to zarf artifacts
    core.info("Adding read/write/execute permissions to zarf artifacts...");
    fs.chmodSync(pathToBinary, "700");
    // if (initPackage == "true") {
    //   fs.chmodSync(pathToInitPackage, "700");
    // }

    // Cache the zarf binary
    core.info("Caching the zarf binary...");
    const binaryFile = os.platform().startsWith("win") ? "zarf.exe" : "zarf";
    const toolName = "zarf";
    const binCachedPath = await tc.cacheFile(pathToBinary, binaryFile, toolName, version);
    core.info(`Cached the zarf binary at ${ binCachedPath }`);

    // // Cache the zarf init package
    // core.info("Caching the zarf init package...");
    // const initPackageCachedPath = await tc.cacheFile(pathToInitPackage, initPackageTarball, toolName, version);
    // core.info(`Cached the zarf init package at ${ initPackageCachedPath }`);

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

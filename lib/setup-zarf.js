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

async function getZarfInitPackage(version) {
  const arch = os.arch();
  const tarball = `zarf-init-${ mapArch(arch) }-v${ version }.tar.zst`;
  const initPackageURL = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ tarball }`;

  // Set the path where the zarf init package will be installed
  const homeDirectory = os.homedir();
  const initPackagePath = path.join(homeDirectory, ".zarf", tarball);
  core.info(`The zarf init package ${ tarball } will be installed at ${ initPackagePath }`);

  // Download the zarf init package
  core.info(`Downloading the zarf init package from ${ initPackageURL }...`);
  const pathToInitPackage = await tc.downloadTool(initPackageURL, initPackagePath);
  core.info(`Successfully downloaded ${ initPackageURL }`);
  core.info(`The zarf init package is at ${ pathToInitPackage }`);

  // Copy the init package to the current working directory
  const workingDir = process.cwd();
  core.info(`Copying the zarf init package from ${ pathToInitPackage } to ${ workingDir }...`);
  await io.cp(pathToInitPackage, workingDir);
}

async function validateInitPackageInput(downloadInitPackage) {
  if (await downloadInitPackage !== "true" && await downloadInitPackage !== "false") {
      core.setFailed("Available values for download_init_package are 'true' or 'false'. Letters should be all lowercase. The default value is set to 'false'.");
  }
}

async function setupZarf() {
  try {
    // Get version of zarf from user input
    const version = core.getInput("version");

    // Get whether we will download an init package from user input
    const downloadInitPackage = core.getInput("download_init_package");
    
    // Get the zarf binary
    const zarfBinary = (await getZarfBinary(version)).pathToBinary;

    // Get the zarf init package
    if (downloadInitPackage == "true") {
      getZarfInitPackage(version);
    } else {
      validateInitPackageInput();
    }

    // Add read/write/execute permissions to the zarf binary
    core.info("Adding read/write/execute permissions to the zarf binary...");
    fs.chmodSync(zarfBinary, "700");

    // Cache the zarf binary
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

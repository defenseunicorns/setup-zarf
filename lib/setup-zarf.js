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

function getRunnerSpecs() {
  const arch = os.arch();
  const homeDirectory = os.homedir();
  const platform = os.platform();

  return { 
    arch,
    homeDirectory,
    platform
  };
}

function setBinaryInstallPath(homeDirectory) {
  const binPath = os.platform().startsWith("win") ? ".zarf\\bin\\zarf.exe" : ".zarf/bin/zarf";
  const installPath = path.join(homeDirectory, binPath);

  return installPath;
}

function setInitPackageInstallPath(arch, homeDirectory, version) {
  const tarball = `zarf-init-${ mapArch(arch) }-${ version }.tar.zst`;
  const initPackagePath = path.join(homeDirectory, ".zarf", tarball);

  return { 
    tarball,
    initPackagePath
  };
}

function setZarfBinaryUrl(arch, platform, version) {
  const exeSuffix = platform.startsWith("win") ? ".exe" : "";
  const filename = `zarf_${ version }_${ mapOS(platform) }_${ mapArch(arch) }${ exeSuffix }`;

  return `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ filename }`;
}

async function getZarfBinary(arch, installPath, platform, version) {
  const binaryURL = setZarfBinaryUrl(platform, arch, version);
  const pathToBinary = await tc.downloadTool(binaryURL, installPath);
  
  return pathToBinary;
}

function addPermissionsToBinary(zarfBinary) {
  fs.chmodSync(zarfBinary, "700");
}

async function cacheZarfBinary(zarfBinary, version) {
  const binaryFile = os.platform().startsWith("win") ? "zarf.exe" : "zarf";
  const toolName = "zarf";
  const binCachedPath = await tc.cacheFile(zarfBinary, binaryFile, toolName, version);

  return binCachedPath;
}

function addBinaryToPath(binCachedPath) {
  core.addPath(binCachedPath);
}

async function getZarfInitPackage(initPackagePath, tarball, version) {
  const initPackageURL = `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ tarball }`;
  const pathToInitPackage = await tc.downloadTool(initPackageURL, initPackagePath);

  return {
    pathToInitPackage,
    initPackageURL
  };
}

async function copyInitPackageToWorkingDir(pathToInitPackage) {
  const workingDir = process.cwd();
  await io.cp(pathToInitPackage, workingDir);
}

async function setupZarf(arch, binaryURL, binCachedPath, initPackagePath, initPackageURL ,installPath, pathToInitPackage, platform, tarball) {
  try {
    const version = core.getInput("version");
    const downloadInitPackage = core.getBooleanInput("download-init-package");
    
    if (downloadInitPackage === true) {
      core.debug(`Is ${ tarball } defined or undefined`);
      core.info(`Downloading the zarf init package from ${ initPackageURL }...`);
      await getZarfInitPackage(initPackagePath, tarball, version);
      core.info(`Successfully downloaded ${ initPackageURL }`);
      core.info(`The zarf init package is at ${ pathToInitPackage }`);
      await copyInitPackageToWorkingDir(pathToInitPackage);
    }

    core.info(`Zarf version ${ version } will be installed at ${ installPath }`);
    core.info(`Downloading the zarf binary from ${ binaryURL }...`);
    const zarfBinary = (await getZarfBinary(arch, installPath, platform, version)).pathToBinary;

    core.info(`Successfully downloaded ${ binaryURL }`);
    core.info(`The zarf binary is at ${ zarfBinary }`);

    core.info("Adding read/write/execute permissions to the zarf binary...");
    addPermissionsToBinary(zarfBinary);
    
    core.info("Caching the zarf binary...");
    await cacheZarfBinary(zarfBinary, version);
    core.info(`Cached the zarf binary at ${ binCachedPath }`);

    core.info(`Adding ${ binCachedPath } to the $PATH...`);
    addBinaryToPath(binCachedPath);
    
    core.info("Zarf has been successfully installed/configured and is ready to use!");

  } catch(error) {
      core.setFailed(error.message);
  }
}

module.exports = {
  getRunnerSpecs,
  mapArch,
  mapOS,
  setBinaryInstallPath,
  setInitPackageInstallPath,
  setZarfBinaryUrl,
  setupZarf
};
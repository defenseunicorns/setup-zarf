// External packages
import core from "@actions/core";
import io from "@actions/io";
import tc from "@actions/tool-cache";

// Node.js core packages
import fs from "fs";
import os from "os";
import path from "path";

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

function runnerSpecs() {
  const arch = os.arch();
  const homeDirectory = os.homedir();
  const platform = os.platform();

  return arch, homeDirectory, platform;
}

function setInstallPath(homeDirectory, version) {
  const binPath = os.platform().startsWith("win") ? ".zarf\\bin\\zarf.exe" : ".zarf/bin/zarf";
  const installPath = path.join(homeDirectory, binPath);
  core.info(`Zarf version ${ version } will be installed at ${ installPath }`);

  return installPath;
}

function setZarfBinaryUrl(arch, platform, version) {
  const exeSuffix = platform.startsWith("win") ? ".exe" : "";
  const filename = `zarf_${ version }_${ mapOS(platform) }_${ mapArch(arch) }${ exeSuffix }`;

  return `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ filename }`;
}

async function getZarfBinary(arch, installPath, platform) {
  const binaryURL = setZarfBinaryUrl(platform, arch);
  core.info(`Downloading the zarf binary from ${ binaryURL }...`);
  const pathToBinary = await tc.downloadTool(binaryURL, installPath);
  core.info(`Successfully downloaded ${ binaryURL }`);
  core.info(`The zarf binary is at ${ pathToBinary }`);

  return pathToBinary;
}

async function getZarfInitPackage(version) {
  const arch = os.arch();
  const tarball = `zarf-init-${ mapArch(arch) }-${ version }.tar.zst`;
  const initPackageURL = `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ tarball }`;

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

async function setupZarf() {
  try {
    // Get version of zarf from user input
    const version = core.getInput("version");

    // Get whether we will download an init package from user input
    const downloadInitPackage = core.getBooleanInput("download-init-package");
    
    // Get the zarf init package
    if (downloadInitPackage === true) {
      await getZarfInitPackage(version);
    } 

    // Get the zarf binary
    const zarfBinary = (await getZarfBinary(version)).pathToBinary;

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

export { mapArch, mapOS, runnerSpecs, setupZarf, setInstallPath, setZarfBinaryUrl };

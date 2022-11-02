import * as core from "@actions/core";
import { cp } from "@actions/io";
import * as tc from "@actions/tool-cache";
import { chmodSync } from "fs";
import * as os from "os";
import { join } from "path";

export const zarfFileName = __filename;

export function mapArch() {
  let archMap = new Map();
  archMap.set("x64", "amd64");
  const amdMap = archMap.get("x64");
  
  return amdMap;
}

export function mapOS() {
  let osMap = new Map();
  osMap.set("darwin", "Darwin");
  osMap.set("linux", "Linux");
  osMap.set("win32", "Windows");

  const macMap = osMap.get("darwin");
  const linuxMap = osMap.get("linux");
  const windowsMap = osMap.get("win32");

  return { macMap, linuxMap, windowsMap };
}

function getRunnerPlatform(version: string) {
  let filename = "";

  if (os.platform() === "darwin") {
    filename = `zarf_${ version }_${ mapOS().macMap }_${ mapArch() }`;
  } else if (os.platform() === "linux") {
    filename = `zarf_${ version }_${ mapOS().linuxMap }_${ mapArch() }`;
  } else if (os.platform() === "win32") {
    filename = `zarf_${ version }_${ mapOS().windowsMap }_${ mapArch() }`;
  }

  return filename;
}

export async function setupZarf(zarfFileName: string) {
  try {
    // Get user input
    const version = core.getInput("version");
    const downloadInitPackage = core.getBooleanInput("download-init-package");
    
    // Download init package
    if (downloadInitPackage === true) {
      const tarball = `zarf-init-${ mapArch() }-${ version }.tar.zst`;
      const initPackagePath = join(os.homedir(), ".zarf", tarball);
      const initPackageURL = `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ tarball }`;
      const pathToInitPackage = await tc.downloadTool(initPackageURL, initPackagePath);
      await cp(pathToInitPackage, process.cwd());
    }

    // Download zarf binary
    const exeSuffix = os.platform().startsWith("win") ? ".exe" : "";
    const binary = zarfFileName + exeSuffix;
    const binaryURL = `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ binary }`;
    const binPath = os.platform().startsWith("win") ? ".zarf\\bin\\zarf.exe" : ".zarf/bin/zarf";
    const installPath = join(os.homedir(), binPath);
    const zarfBinary = await tc.downloadTool(binaryURL, installPath);

    // Add read/write/execute permissions to binary
    chmodSync(zarfBinary, "700");
    
    // Cache the zarf binary
    const binaryFile = os.platform().startsWith("win") ? "zarf.exe" : "zarf";
    const toolName = "zarf";
    const binCachedPath = await tc.cacheFile(zarfBinary, binaryFile, toolName, version);

    // Add binary to the $PATH
    core.addPath(binCachedPath);
    
    core.info("Zarf has been successfully installed/configured and is ready to use!");

  } catch(error) {
      let errorMessage = "Failed to setup Zarf";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      core.setFailed(errorMessage);
  }
}

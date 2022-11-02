import * as core from "@actions/core";
import { cp } from "@actions/io";
import * as tc from "@actions/tool-cache";
import { chmodSync } from "fs";
import * as os from "os";
import { join } from "path";

let platform: string = ""

if (os.platform() === "darwin") {
  platform = `${ mapOS().macMap }_${ mapArch() }`

} else if (os.platform() === "linux") {
  platform = `${ mapOS().linuxMap }_${ mapArch() }`;

} else if (os.platform() === "win32") {
  platform = `${ mapOS().windowsMap }_${ mapArch() }`;
}

export const runnerPlatform: string = platform;

export function mapArch() {
    let archMap = new Map();
    archMap.set("x64", "amd64");
    const amdMap: string = archMap.get("x64");
    
    return amdMap;
}

export function mapOS() {
    let osMap = new Map();
    osMap.set("darwin", "Darwin");
    osMap.set("linux", "Linux");
    osMap.set("win32", "Windows");

    const macMap: string = osMap.get("darwin");
    const linuxMap: string = osMap.get("linux");
    const windowsMap: string = osMap.get("win32");

    return { macMap, linuxMap, windowsMap };
}

export async function setupZarf(runnerPlatform: string) {
    try {
      // Get user input
      const version: string = core.getInput("version");
      const downloadInitPackage: boolean = core.getBooleanInput("download-init-package");
      
      // Download init package
      if (downloadInitPackage === true) {
        const tarball: string = `zarf-init-${ mapArch() }-${ version }.tar.zst`;
        const initPackagePath: string = join(os.homedir(), ".zarf", tarball);
        const initPackageURL: string = `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ tarball }`;
        const pathToInitPackage: string = await tc.downloadTool(initPackageURL, initPackagePath);
        await cp(pathToInitPackage, process.cwd());
      }

      // Download zarf binary
      const exePrefix: string = `zarf_${ version }_`
      const exeSuffix: string = os.platform().startsWith("win") ? ".exe" : "";
      const binary: string = exePrefix + runnerPlatform + exeSuffix;
      const binaryURL: string = `https://github.com/defenseunicorns/zarf/releases/download/${ version }/${ binary }`;
      const binPath: string = os.platform().startsWith("win") ? ".zarf\\bin\\zarf.exe" : ".zarf/bin/zarf";
      const installPath: string = join(os.homedir(), binPath);
      const zarfBinary: string = await tc.downloadTool(binaryURL, installPath);

      // Add read/write/execute permissions to binary
      chmodSync(zarfBinary, "700");
      
      // Cache the zarf binary
      const binaryFile: string = os.platform().startsWith("win") ? "zarf.exe" : "zarf";
      const toolName: string = "zarf";
      const binCachedPath: string = await tc.cacheFile(zarfBinary, binaryFile, toolName, version);

      // Add binary to the $PATH
      core.addPath(binCachedPath);
      
      core.info("Zarf has been successfully installed/configured and is ready to use!");

      return version;

    } catch(error) {
        let errorMessage: string = "Failed to setup Zarf";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        core.setFailed(errorMessage);
    }
}

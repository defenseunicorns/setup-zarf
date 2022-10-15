// External packages
const core = require("@actions/core");
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

function getZarf(version) {
  // If we're on Windows, then the executable ends with .exe
  const exeSuffix = os.platform().startsWith("win") ? ".exe" : "";

  const platform = os.platform();
  const arch = os.arch();

  const filename = `zarf_v${ version }_${ mapOS(platform) }_${ mapArch(arch) }${ exeSuffix }`;
  const downloadURL = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ filename }`;

  return {
    downloadURL
  };
}

async function setupZarf() {
  try {
    // Get version of zarf from user input
    const version = core.getInput("version");

    const zarfDownloadURL = getZarf(version).downloadURL;
    core.debug(zarfDownloadURL);

    // Set the path where the zarf binary will be installed
    const homeDirectory = os.homedir();
    const binPath = os.platform().startsWith("win") ? ".zarf\\bin\\zarf.exe" : ".zarf/bin/zarf";
    const installPath = path.join(homeDirectory, binPath);
    core.info(`Zarf version v${ version } will be installed at ${ installPath }`);

    // Download the zarf binary
    core.info(`Downloading the zarf binary from ${ zarfDownloadURL }`);
    const pathToBinary = await tc.downloadTool(zarfDownloadURL, installPath);
    core.info(`Successfully downloaded ${ zarfDownloadURL }`);
    core.info(`The zarf binary is at ${ pathToBinary }`);

    // Add read/write/execute permissions to the binary file
    core.info(`Adding read/write/execute permissions to ${ pathToBinary }`);
    fs.chmodSync(pathToBinary, "700");

    // Cache the zarf binary
    core.info("Caching the zarf binary...");
    const targetFile = os.platform().startsWith("win") ? "zarf.exe" : "zarf";
    const toolName = "zarf";
    const cachedPath = await tc.cacheFile(pathToBinary, targetFile, toolName, version);
    core.info(`Cached the zarf binary at ${ cachedPath }`);

    // Expose the zarf binary by adding it to the $PATH environment variable
    core.info(`Adding ${ cachedPath }/zarf to the $PATH...`);
    core.addPath(cachedPath);
    
    // Zarf is ready for use
    core.info("Zarf has been successfully installed/configured and is ready to use!");

  } catch(error) {
      core.setFailed(error.message);
  }
}

module.exports = setupZarf();

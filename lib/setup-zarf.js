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
  const platform = os.platform();
  const arch = os.arch();
  const filename = `zarf_v${ version }_${ mapOS(platform) }_${ mapArch(arch) }`;
  const url = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ filename }`;
  return {
    filename,
    url
  };
}

// Append .exe file extension to zarf binary if running on a Windows runner
let zarfWindowsDownloadURL;
let windowsBinPath;

function isWindowsRunner(version) {
    if (os.platform().startsWith("win")) {
      const fileExtension = ".exe";
      const windowsExecutable = getZarf(version).filename + fileExtension;
      zarfWindowsDownloadURL = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ windowsExecutable }`;
    }
    return {
      zarfWindowsDownloadURL,
      windowsBinPath
    };
}

async function setupZarf() {
  try {
    // Get version of zarf from user input
    const version = core.getInput("version");

    const download = getZarf(version);

    // Set the path where the zarf binary will be installed
    let binPath = "";
    let zarfDownloadURL;

    if (isWindowsRunner) {
      binPath = ".zarf\\bin\\zarf.exe";
      zarfDownloadURL = isWindowsRunner().zarfWindowsDownloadURL;
    } else {
      binPath = ".zarf/bin/zarf";
      zarfDownloadURL = download.url;
    }

    const homeDirectory = os.homedir();
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

    let cachedPath = "";

    if (isWindowsRunner) {
      cachedPath = await tc.cacheFile(pathToBinary, "zarf.exe", "zarf", version);
      core.info(`Cached the zarf binary at ${ cachedPath }/zarf.exe`);
    } else {
      cachedPath = await tc.cacheFile(pathToBinary, "zarf", "zarf", version);
      core.info(`Cached the zarf binary at ${ cachedPath }/zarf`);
    }

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

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

function windowsRunner() {
  if (os.platform().startsWith("win")) {
    return true;
  } else {
    return false;
  }
}

function getZarf(version) {
  const platform = os.platform();
  const arch = os.arch();
  let url = "";
  if (windowsRunner == true) {
    const windowsFilename = `zarf_v${ version }_${ mapOS(platform) }_${ mapArch(arch) }.exe`;
    url = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ windowsFilename }`;
  } else {
    const filename = `zarf_v${ version }_${ mapOS(platform) }_${ mapArch(arch) }`;
    url = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ filename }`;
  }
  const downloadURL = url;
  return downloadURL;
}

async function setupZarf() {
  try {
    // Get version of zarf from user input
    const version = core.getInput("version");

    // Set the path where the zarf binary will be installed
    let filePath = "";

    if (windowsRunner == true) {
      const windowsPath = ".zarf\\bin\\zarf.exe";
      filePath = windowsPath;
    } else {
      const unixPath = ".zarf/bin/zarf";
      filePath = unixPath;
    }

    const binPath = filePath;
    const download = getZarf(version);
    const zarfDownloadURL = download.downloadURL;
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

    let preCachedPath = "";

    if (windowsRunner == true) {
      preCachedPath = await tc.cacheFile(pathToBinary, "zarf.exe", "zarf", version);
      core.info(`Cached the zarf binary at ${ preCachedPath }/zarf.exe`);
    } else {
      preCachedPath = await tc.cacheFile(pathToBinary, "zarf", "zarf", version);
      core.info(`Cached the zarf binary at ${ preCachedPath }/zarf`);
    }

    const cachedPath = preCachedPath;

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

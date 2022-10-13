// External packages
import core from '@actions/core';
import tc from '@actions/tool-cache';

// Node.js core packages
import fs from 'fs';
import os from 'os';
import path from 'path';

// Map for names of runner architectures
function mapArch(arch: string) {
  const archMap = new Map();
  archMap.set("x64", "amd64");
  return archMap;
}

// Map for names of runner operating systems
function mapOS(os: string) {
  const osMap = new Map();
  osMap.set("darwin", "Darwin");
  osMap.set("linux", "Linux");
  return osMap;
}

// Construct the zarf download url
export function getZarf(version: string) {
  const platform = os.platform();
  const arch = os.arch();
  const filename = `zarf_v${ version }_${ mapOS(platform) }_${ mapArch(arch) }`;
  const url = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ filename }`;
  return {
    url
  };
}

async function setupZarf() {
  try {
    // Get version of zarf from user input
    const version = core.getInput('version');

    // Set the path where the zarf binary will be installed
    const homeDirectory = os.homedir();
    const binPath = '.zarf/bin/zarf';
    const installPath = path.join(homeDirectory, binPath);
    core.info(`Zarf version v${version} will be installed at ${installPath}`);

    // Download the specified version of zarf
    const download = getZarf(version);
    const zarfDownloadURL = download.url;
    core.info(`Downloading the zarf binary from ${zarfDownloadURL}`);
    const pathToBinary = await tc.downloadTool(zarfDownloadURL, installPath);
    core.info(`Successfully downloaded ${zarfDownloadURL}`);
    core.info(`The zarf binary is at ${pathToBinary}`);

    // Add read/write/execute permissions to the binary file
    core.info(`Adding read/write/execute permissions to ${pathToBinary}`);
    fs.chmodSync(pathToBinary, '700');

    // Cache the zarf binary
    core.info('Caching the zarf binary...');
    const cachedPath = await tc.cacheFile(pathToBinary, 'zarf', 'zarf', version);
    core.info(`Cached the zarf binary at ${cachedPath}/zarf`);

    // Expose the zarf binary by adding it to the $PATH environment variable
    core.info(`Adding ${cachedPath}/zarf to the $PATH...`);
    core.addPath(cachedPath);
    
    // Zarf is ready for use
    core.info('Zarf has been successfully installed/configured and is ready to use!');

  } catch(error) {
    let errorMessage = "Failed to install Zarf";
    if (error instanceof Error) {
      errorMessage = error.message;
      core.setFailed(errorMessage);
    }
  }
}

setupZarf();
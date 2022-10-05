const os = require('os');
const path = require('path');

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch(arch) {
  const mappings = {
    // os.arch() returns 'arm64', which is in the same format as the zarf binary
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS(os) {
  const mappings = {
    darwin: 'Darwin',
    linux: 'Linux'
  };
  return mappings[os] || os;
}

function getZarfBinary(version) {
  const platform = os.platform();
  const filename = `zarf_${ version }_${ mapOS(platform) }_${ mapArch(os.arch()) }`;
  const extension = 'tar.gz';
  const binPath = path.join(filename, 'bin');
  const url = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ filename }.${ extension }`;
  return {
    url,
    binPath
  };
}

module.exports = { getZarfBinary }

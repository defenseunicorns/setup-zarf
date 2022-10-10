import os from 'os';

function mapArch(arch) {
  const mappings = {
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

function mapOS(os) {
  const mappings = {
    darwin: 'Darwin',
    linux: 'Linux'
  };
  return mappings[os] || os;
}

export function getZarfBinary(version: string) {
  const platform = os.platform();
  const arch = os.arch();
  const filename = `zarf_v${ version }_${ mapOS(platform) }_${ mapArch(arch) }`;
  const url = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ filename }`;
  return {
    url
  };
}
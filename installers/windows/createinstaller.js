const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
    console.log("Criando Instalador Windows");
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'Editor-Visual-YML-Arkhi-win32-ia32'),
    authors: 'Gladson Bruno Soares dos Santos',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'Editor-Visual-YML-Arkhi.exe',
    setupExe: 'EditorVisualYMLArkhi.exe',
    setupIcon: path.join(rootPath, 'assets', 'icons', 'win', 'icon.ico')
  })
}
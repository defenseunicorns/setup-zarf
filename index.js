import * as setup from "./lib/setup-zarf.js";

function execute() {
    setup.mapArch();
    setup.mapOS();
    setup.getRunnerSpecs();
    setup.setBinaryInstallPath();
    setup.setInitPackageInstallPath();
    setup.setupZarf();
}

execute();
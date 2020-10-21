/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fse from 'fs-extra';
import * as path from 'path';
import { TextDocument, window, workspace, WorkspaceFolder } from 'vscode';
import { DialogResponses } from 'vscode-azureextensionui';
import { appArtifactSubpathSetting, routesFileName } from "../../constants";
import { ext } from "../../extensionVariables";
import { localize } from '../../utils/localize';
import { getWorkspaceSetting } from '../../utils/settingsUtils';
import { IRoutesFile } from './IRoutesFile';

export async function addRoutesFile(workspacePath?: string): Promise<void> {
    // tslint:disable-next-line: strict-boolean-expressions
    const folders: readonly WorkspaceFolder[] = workspace.workspaceFolders || [];
    // if there is only one workspace, use that as the workspace path
    if (workspacePath || folders.length === 1) {
        workspacePath = workspacePath || folders[0].uri.fsPath;
        const appArtifactSubpath: string | undefined = getWorkspaceSetting(appArtifactSubpathSetting, workspacePath);
        workspacePath = appArtifactSubpath ? path.join(workspacePath, appArtifactSubpath) : workspacePath;
    }

    if (!workspacePath) {
        workspacePath = (await ext.ui.showOpenDialog({ canSelectFiles: false, canSelectFolders: true }))[0].fsPath;
    }

    if (await fse.pathExists(path.join(workspacePath, routesFileName))) {
        const message: string = localize('routesExist', '\'routes.json\' file already exists.  Overwrite?');
        if (await ext.ui.showWarningMessage(message, { modal: true }, DialogResponses.yes, DialogResponses.cancel) !== DialogResponses.yes) {
            return;
        }
    }

    const routesFsPath: string = path.join(workspacePath, routesFileName);
    const routeSettings: IRoutesFile = {
        routes: [
            {
                route: '/*',
                serve: '/index.html',
                statusCode: 200
            }
        ]
    };

    await fse.ensureFile(routesFsPath);
    await fse.writeJson(routesFsPath, routeSettings, { spaces: 2 });
    const doc: TextDocument = await workspace.openTextDocument(routesFsPath);
    await window.showTextDocument(doc);
}

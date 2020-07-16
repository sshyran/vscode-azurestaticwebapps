/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IActionContext } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { JobTreeItem } from '../../tree/JobTreeItem';
import { StepTreeItem } from '../../tree/StepTreeItem';

export async function showJobLogs(context: IActionContext, node?: JobTreeItem | StepTreeItem): Promise<void> {
    if (!node) {
        node = await ext.tree.showTreeItemPicker<JobTreeItem>(JobTreeItem.contextValue, context);
    }
    await node.showLogs();
}

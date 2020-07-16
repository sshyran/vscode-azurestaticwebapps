/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { AzureTreeItem, TreeItemIconPath } from 'vscode-azureextensionui';
import { treeUtils } from '../utils/treeUtils';
import { ActionTreeItem } from './ActionTreeItem';
import { GitHubJob } from './JobTreeItem';

export class SkippedJobTreeItem extends AzureTreeItem {
    public static contextValue: string = 'azureStaticJobSkipped';
    public readonly contextValue: string = SkippedJobTreeItem.contextValue;
    public parent: ActionTreeItem;
    public data: GitHubJob;

    constructor(parent: ActionTreeItem, data: GitHubJob) {
        super(parent);
        this.data = data;
    }

    public get iconPath(): TreeItemIconPath {
        return this.data.conclusion ? treeUtils.getThemedIconPath(path.join('conclusions', this.data.conclusion)) : treeUtils.getThemedIconPath(path.join('statuses', this.data.status));
    }

    public get id(): string {
        return `${this.parent.parent.id}/${this.data.id}`;
    }

    public get name(): string {
        return this.data.name;
    }

    public get label(): string {
        return this.name;
    }

    public get description(): string {
        return this.data.conclusion;
    }
}

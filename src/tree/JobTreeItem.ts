/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Octokit } from '@octokit/rest';
import { ActionsGetJobForWorkflowRunResponseData } from '@octokit/types';
import moment = require('moment');
import { AzExtTreeItem, AzureParentTreeItem, IActionContext, TreeItemIconPath } from "vscode-azureextensionui";
import { createOctokitClient } from '../commands/github/createOctokitClient';
import { getActionIconPath } from '../utils/actionUtils';
import { convertConclusionToVerb, convertStatusToVerb, getRepoFullname } from '../utils/gitHubUtils';
import { getTimeElapsedString } from '../utils/timeUtils';
import { ActionTreeItem } from './ActionTreeItem';
import { IAzureResourceTreeItem } from './IAzureResourceTreeItem';
import { StepTreeItem } from './StepTreeItem';

export class JobTreeItem extends AzureParentTreeItem implements IAzureResourceTreeItem {
    public static contextValue: string = 'azureStaticJob';
    public readonly contextValue: string = JobTreeItem.contextValue;
    public parent: ActionTreeItem;
    public data: ActionsGetJobForWorkflowRunResponseData;

    constructor(parent: ActionTreeItem, data: ActionsGetJobForWorkflowRunResponseData) {
        super(parent);
        this.data = data;
    }

    public get iconPath(): TreeItemIconPath {
        return getActionIconPath(this.data);
    }

    public get id(): string {
        return this.data.id.toString();
    }

    public get name(): string {
        return this.data.name;
    }

    public get label(): string {
        return this.name;
    }

    public get description(): string {
        if (this.data.conclusion) {
            const elapsedTime: string = getTimeElapsedString(this.startedDate, this.completedDate);
            return `${convertConclusionToVerb(this.data.conclusion)} ${moment(this.completedDate).fromNow()} in ${elapsedTime}`;
        } else {
            return `${convertStatusToVerb(this.data.status)} ${moment(this.startedDate).fromNow()}`;
        }
    }

    private get startedDate(): Date {
        return new Date(this.data.started_at);
    }

    private get completedDate(): Date {
        return new Date(this.data.completed_at);
    }

    public async loadMoreChildrenImpl(_clearCache: boolean, _context: IActionContext): Promise<AzExtTreeItem[]> {
        return this.data.steps.map((step => {
            return new StepTreeItem(this, step);
        }));
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async refreshImpl(): Promise<void> {
        const { owner, name } = getRepoFullname(this.parent.parent.repositoryUrl);
        const octokitClient: Octokit = await createOctokitClient();
        this.data = (await octokitClient.actions.getJobForWorkflowRun({ job_id: this.data.id, owner: owner, repo: name })).data;
    }

    public compareChildrenImpl(ti1: StepTreeItem, ti2: StepTreeItem): number {
        return ti1.data.number - ti2.data.number;
    }
}

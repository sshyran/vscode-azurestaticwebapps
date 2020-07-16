/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { window } from 'vscode';
import { AzureTreeItem, openReadOnlyContent, TreeItemIconPath } from "vscode-azureextensionui";
import { ext } from '../extensionVariables';
import { localize } from '../utils/localize';
import { logsUtils } from '../utils/logsUtils';
import { treeUtils } from "../utils/treeUtils";
import { JobTreeItem } from './JobTreeItem';

export type GitHubStep = {
    name: string;
    status: string;
    conclusion: string;
    // tslint:disable-next-line: no-reserved-keywords
    number: number;
    started_at: string;
    completed_at: string;
};

export class StepTreeItem extends AzureTreeItem {

    public static contextValue: string = 'azureStaticStep';
    public readonly contextValue: string = StepTreeItem.contextValue;
    public parent: JobTreeItem;
    public data: GitHubStep;

    private readonly _startedDate: Date;
    private readonly _completedDate: Date;

    constructor(parent: JobTreeItem, data: GitHubStep) {
        super(parent);
        this.data = data;
        this._startedDate = new Date(this.data.started_at);
        this._completedDate = new Date(this.data.completed_at);
    }

    public get iconPath(): TreeItemIconPath {
        return this.data.conclusion ? treeUtils.getThemedIconPath(path.join('conclusions', this.data.conclusion)) : treeUtils.getThemedIconPath(path.join('statuses', this.data.status));
    }

    public get id(): string {
        return `${this.parent.parent.id}/${this.data.name}`;
    }

    public get name(): string {
        return this.data.name;
    }

    public get label(): string {
        return this.name;
    }

    public get description(): string {
        return logsUtils.getTimeElapsedString(this._startedDate, this._completedDate);
    }

    public get commandId(): string {
        return `${ext.prefix}.showJobLogs`;
    }

    public async showLogs(): Promise<void> {
        await this.runWithTemporaryDescription(localize('loadingStepLogs', 'Loading Step logs...'), async (): Promise<void> => {
            const stepLogs: string = await this.getStepLogs();
            if (stepLogs.length < 1) {
                window.showInformationMessage(localize('noLogsForStep', 'There are no logs for this step.'));
            } else {
                await openReadOnlyContent(this, stepLogs, '');
            }
        });
    }

    private async getStepLogs(): Promise<string> {
        const jobLogs: string = await this.parent.getLogs();

        // only get logs that are between the start and end time for this step
        return jobLogs
            .split(/\n|\r/)
            .filter((line: string): boolean => {
                return this._startedDate < logsUtils.getTimestamp(line) && this._completedDate > logsUtils.getTimestamp(line);
            })
            .join('\n');
    }
}

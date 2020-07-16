/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { window } from 'vscode';
import { AzureTreeItem, openReadOnlyContent, TreeItemIconPath } from "vscode-azureextensionui";
import { ext } from '../extensionVariables';
import { localize } from '../utils/localize';
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

    constructor(parent: JobTreeItem, data: GitHubStep) {
        super(parent);
        this.data = data;
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
        const startDate: Date = new Date(this.data.started_at);
        const completeDate: Date = new Date(this.data.completed_at);
        const timeToComplete: number = (completeDate.getTime() - startDate.getTime()) / 1000;
        if (timeToComplete > 59) {
            const minutes: number = Math.floor(timeToComplete / 60);
            const seconds: number = timeToComplete - minutes * 60;
            return `${this.data.conclusion} in ${minutes}m ${seconds}s`;
        } else {
            return `${this.data.conclusion} in ${timeToComplete}s`;
        }
    }

    public get commandId(): string {
        if (this.data.conclusion !== 'skipped') {
            return `${ext.prefix}.showJobLogs`;
        } else {
            return '';
        }
    }

    public async showLogs(): Promise<void> {
        const logs: string = await this.parent.getLogs();
        const startDate: Date = new Date(this.data.started_at);
        const completeDate: Date = new Date(this.data.completed_at);
        const lines: string[] = logs.split('\n').filter((line: string): boolean => {
            return startDate < this.getTimestamp(line) && completeDate > this.getTimestamp(line);
        });
        const str: string = lines.join('\n');
        if (str.length < 1) {
            window.showInformationMessage(localize('noLogsForStep', 'There are no logs for this step.'));
        } else {
            await openReadOnlyContent(this, str, '.log');
        }
    }

    private getTimestamp(line: string): Date {
        return new Date(line.split(' ')[0]);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export namespace logsUtils {
    export function getTimestamp(line: string): Date {
        return new Date(line.split(' ')[0]);
    }

    export function getTimeElapsedString(start: Date, end: Date): string {
        const deltaMs: number = (end.getTime() - start.getTime()) / 1000;
        if (deltaMs > 59) {
            const minutes: number = Math.floor(deltaMs / 60);
            const seconds: number = deltaMs - minutes * 60;
            return `${minutes}m ${seconds}s`;
        } else {
            return `${deltaMs}s`;
        }
    }
}

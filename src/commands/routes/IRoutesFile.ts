/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// interface defined by https://docs.microsoft.com/en-us/azure/static-web-apps/routes
export interface IRoutesFile {
    routes: [
        {
            route: string;
            serve?: string;
            allowedRoles?: string[];
            statusCode?: number;
        }
    ];
    platformErrorOverrides?: [
        {
            errorType: string;
            statusCode?: number;
            serve?: string;
        }
    ];
    defaultHeaders?: { [key: string]: string };
    mimeTypes?: {};
}

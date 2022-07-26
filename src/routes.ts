import { Express, static as expressStatic } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { ApiRoute } from './interfaces';
import { errorLog } from './common';
import { CoreRequest } from './apis/request';
import { HttpStatusCode } from './types';
import { adminApis } from './routes/admin';
import { publicApis } from './routes/public';
import { Const } from './const';

export namespace WebRoutes {
    let basePath = '/api/';
    export let assetsBaseUrl = '/assets';

    export function routes(app: Express) {
        // =>get all apis
        let apis = getRoutes();
        // console.log(apis)
        // =>add admin apis
        for (const api of apis) {
            app[api.method.toLowerCase()](api.absPath, async (req, res) => {
                // =>init core request class
                let coreRequest = req.body[Const.CoreRequestKey] as CoreRequest;
                // =>find target class file
                let classFilePath = path.join(path.dirname(__filename), 'apis', api.type, api.method.toLowerCase() + '.js');
                if (!fs.existsSync(classFilePath)) {
                    errorLog('route', `not found request class file: '${classFilePath}'`);
                    coreRequest.response('', HttpStatusCode.HTTP_404_NOT_FOUND);
                    return;
                }
                // =>init api class
                let classFile = await import(classFilePath);
                let apiClassInstance = new (classFile.classApi())(coreRequest);
                // console.log('req:', api.functionName, apiClassInstance['request'], classFilePath);
                // =>call api function
                let resP = await apiClassInstance[api.functionName]();
                let response: string, status: HttpStatusCode;
                if (Array.isArray(resP)) {
                    [response, status] = resP;
                }
                // =>response 
                coreRequest.response(response, status);
            });
        }
        // =>serve wiki
        if (!Const.CONFIGS.server.wiki_disabled) {
            app.get(Const.CONFIGS.server.wiki_base_url, (req, res) => {
                return res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'wiki.html'));
            });
        }
        app.use(assetsBaseUrl, expressStatic(path.join(__dirname, '..', 'public', 'assets')));
        app.get('/', (req, res) => {
            let html = `<html>
            <body>
            <h1>Welcome to Workflow Engine</h1>
            <hr>`;
            // =>if swagger enabled
            if (!Const.CONFIGS.server.swagger_disabled) {
                html += `
                <p><strong>[+] swagger docs: </strong><a href="${Const.CONFIGS.server.swagger_base_url}">${Const.CONFIGS.server.swagger_base_url}</a></p>`
            }
            // =>if wiki enabled
            if (!Const.CONFIGS.server.wiki_disabled) {
                html += `
                <p><strong>[+] wiki docs: </strong><a href="${Const.CONFIGS.server.wiki_base_url}">${Const.CONFIGS.server.wiki_base_url}</a></p>`
            }
            html += `
            </body>
            </html>`;
            res.write(html);
            res.end();
        });
        // app.use('/assets', expressStatic(path.join(__dirname, '..', 'public', 'assets')));

    }

    export function getRoutes(): ApiRoute[] {
        let apis: ApiRoute[] = [];
        for (const api of adminApis) {
            api.type = 'admin';
            if (!api.path.startsWith('admin/') && !api.path.startsWith('/admin/')) {
                api.path = 'admin/' + api.path;
            }
            apis.push(api);
        }
        for (const api of publicApis) {
            api.type = 'public';
            apis.push(api);
        }

        for (const api of apis) {
            if (!api.version) {
                api.version = 'v1';
            }
            if (api.path[0] === '/') api.path = api.path.substring(1);
            api.absPath = `${basePath}${api.version}/${api.path}`;
        }
        return apis;
    }
}
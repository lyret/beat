"use strict";
var path = require('path');
var vscode_1 = require('vscode');
var vscode_languageclient_1 = require('vscode-languageclient');
var client;
/** Starts the language server */
function activate(context) {
    /** Path to the server module */
    var serverPath = path.join('..', 'language_server', 'dist', 'server.js');
    console.log(context.asAbsolutePath(serverPath));
    process.exit(1);
    /** Server options */
    var serverOptions = {
        /** Options when launched normaly  */
        run: {
            module: context.asAbsolutePath(serverPath),
            transport: vscode_languageclient_1.TransportKind.ipc
        },
        /** Options when launched in debug mode */
        debug: {
            module: context.asAbsolutePath(serverPath),
            transport: vscode_languageclient_1.TransportKind.ipc,
            /** The debug options for the server */
            options: {
                execArgv: ['--nolazy', '--inspect=6009'] // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
            }
        }
    };
    /** Language client options */
    var clientOptions = {
        /** Register the server for plain text documents */
        documentSelector: [{ scheme: 'file', language: 'beat' }],
        /** Notify the server about file changes to '.clientrc files contained in the workspace */
        synchronize: {
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    // Create the client for connecting to the language server
    client = new vscode_languageclient_1.LanguageClient('BeatLanguageServer', 'Language Server for working with Beat', serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start();
}
exports.activate = activate;
/** Stops the language service */
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;

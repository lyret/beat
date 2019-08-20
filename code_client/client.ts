import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

/** Starts the language server */
export function activate(context: ExtensionContext) {

	/** Path to the server module */
	const serverPath = path.join('..', 'language_server', 'build', 'server.js')
	console.log(context.asAbsolutePath(serverPath))
	process.exit(1);
	/** Server options */
	let serverOptions: ServerOptions = {
		/** Options when launched normaly  */
		run: {
			module: context.asAbsolutePath(serverPath),
			transport: TransportKind.ipc
		},
		/** Options when launched in debug mode */
		debug: {
			module: context.asAbsolutePath(serverPath),
			transport: TransportKind.ipc,
			/** The debug options for the server */
			options: {
				execArgv: ['--nolazy', '--inspect=6009'] // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
			}
		}
	};

	/** Language client options */
	let clientOptions: LanguageClientOptions = {
		/** Register the server for plain text documents */
		documentSelector: [{ scheme: 'file', language: 'beat' }],
		/** Notify the server about file changes to '.clientrc files contained in the workspace */
		synchronize: {
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the client for connecting to the language server
	client = new LanguageClient(
		'BeatLanguageServer',
		'Language Server for working with Beat',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

/** Stops the language service */
export function deactivate(): Thenable<void> {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
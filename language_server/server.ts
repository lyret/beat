import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
} from 'vscode-languageserver';

import {
	validateTextDocument
} from './validations';

import './interfaces';



/**
 * The default language server settings
 * 
 */
const defaultSettings: LanguageServerSettings = { maxNumberOfProblems: 1 }

/**
 * Server runtime object
 * the actual capabilities are determened on initalization,
 * the global settings is used when the `workspace/configuration` request
 * is not supported by the client
 */
const runtime: ServerRuntime = {
	globalSettings: defaultSettings,
	documentSettings: new Map(),
	hasConfigurationCapability: false,
	hasWorkspaceFolderCapability: false,
	hasDiagnosticRelatedInformationCapability: false
}

/**
 * The connection for the server
 * uses Node's IPC as a transport, * also include all preview / proposed LSP features
 */
const connection = createConnection(ProposedFeatures.all);

/**
 * Text document manager. supports full document sync only
 */
const documents: TextDocuments = new TextDocuments();



// Connection events

/** When a client connection is initializing */
connection.onInitialize((params: InitializeParams) => {

	// Determine the runtime cpabilities from the client
	let initalizedCapabilities = params.capabilities;

	runtime.hasConfigurationCapability =
		initalizedCapabilities.workspace && !!initalizedCapabilities.workspace.configuration;
	runtime.hasWorkspaceFolderCapability =
		initalizedCapabilities.workspace && !!initalizedCapabilities.workspace.workspaceFolders;
	runtime.hasDiagnosticRelatedInformationCapability =
		initalizedCapabilities.textDocument &&
		initalizedCapabilities.textDocument.publishDiagnostics &&
		initalizedCapabilities.textDocument.publishDiagnostics.relatedInformation;

	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
			/* Tells the client that the server supports code completion */
			completionProvider: {
				resolveProvider: true
			}
		}
	};
});

/** When client connection initalization is finished */
connection.onInitialized(() => {
	// Register the 'did change configuration' event if the client supports it
	if (runtime.hasConfigurationCapability) {
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}

	// TODO: What does this do?
	// if (runtime.hasWorkspaceFolderCapability) {
	// 	connection.workspace.onDidChangeWorkspaceFolders(_event => {
	// 		connection.console.log('Workspace folder change event received.');
	// 	});
	// }
});

/** When the global client configuration is changed */
connection.onDidChangeConfiguration(change => {

	// Reset all cached document settings when per-document settings is supported
	if (runtime.hasConfigurationCapability) {
		runtime.documentSettings.clear();
	}
	// Load global runtime settings from the  client or fall back to the default settings
	else {
		runtime.globalSettings = change.settings.languageServerExample || defaultSettings // FIXME: 'languageServerExample'
	}

	// Revalidate all open text documents
	documents.all().forEach(document => validateTextDocument(document, connection, runtime));
});

/*
TODO: Should these be re-added ?
connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return [
			{
				label: 'TypeScript',
				kind: CompletionItemKind.Text,
				data: 1
			},
			{
				label: 'JavaScript',
				kind: CompletionItemKind.Text,
				data: 2
			}
		];
	}
);

// TODO: re add text-completetion items
// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			(item.detail = 'TypeScript details'),
				(item.documentation = 'TypeScript documentation');
		} else if (item.data === 2) {
			(item.detail = 'JavaScript details'),
				(item.documentation = 'JavaScript documentation');
		}
		return item;
	}
);
*/



// Document events

/** When a document is closed */
documents.onDidClose(e => {
	// Remove the cached settings
	runtime.documentSettings.delete(e.document.uri);
});

/** When a document is opened or its content has changed */
documents.onDidChangeContent(change => {
	validateTextDocument(change.document, connection, runtime);
});

/*
TODO: What does these do?
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(`${params.textDocument.uri} opened.`);
});
connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});
connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.uri uniquely identifies the document.
	connection.console.log(`${params.textDocument.uri} closed.`);
});
*/



// Make the document manager listen on the connection for open, change and close text document events
documents.listen(connection);



// Listen on the connection
connection.listen();
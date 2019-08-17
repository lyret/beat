import {
	TextDocument,
	Diagnostic,
	DiagnosticSeverity,
	Connection,
	DocumentColorRequest
} from 'vscode-languageserver';

import './interfaces';
import { BeatParser, BeatLexer, /* BeatProblem */ } from 'beat-language-parser'

export function getDocumentSettings(resource: string, connection: Connection, runtime: ServerRuntime): Thenable<LanguageServerSettings> {

	// Return the global settings if the client lacks per-document configuration capability
	if (!runtime.hasConfigurationCapability) {
		return Promise.resolve(runtime.globalSettings);
	}

	// Find the cached settings for the current document
	let result = runtime.documentSettings.get(resource);

	// If no cached settings exists read it and cache it
	if (!result) {

		// Retrive the settings for this document from the client
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample' // FIXME: stringed identifier, change it
		});

		// Cache the document settings
		runtime.documentSettings.set(resource, result);
	}

	// Return this documents settings
	return result;
}


export async function validateTextDocument(textDocument: TextDocument, connection: Connection, runtime: ServerRuntime): Promise<void> {
	// In this simple example we get the settings for every validate run.
	let settings = await getDocumentSettings(textDocument.uri, connection, runtime);
	console.log("RESOURCE: ", textDocument.uri); // NOTE: Debug output
	console.log("settings", settings); // NOTE: Debug output
	let diagnostics: Diagnostic[] = [];
	let text = textDocument.getText();
	const tokens = BeatLexer.tokenize(text).tokens;

	// The validator creates diagnostics for all uppercase words length 2 and more
	// let pattern = /\b[A-Z]{2,}\b/g;
	// let m: RegExpExecArray;

	const problems: /* BeatProblem */any[] = []; //FIXME: was BeatProblem

	try {
		BeatParser.input = tokens;
		BeatParser.createNodeTree();

		if (BeatParser.errors.length > 0) {
			for (const error of BeatParser.errors) {
				problems.push(error as any);  // TODO: Should not need to be any
			}
		}
	} catch (err) {
		problems.push(err);
	}

	/** TODO: Document & Move */
	const getValue = (source : object | undefined, keys : string[]) => {
		if (source == undefined) {
			return undefined;
		}
		for (const key of keys) {
			if (source[key] && !isNaN(source[key])) {
				return source[key];
			}
		}
		return undefined;
	}

	for (const problem of problems) {
		console.log("a problem occured:"); // NOTE: Debug output
		console.log(problem);

		

		const startLine = getValue(problem.previousToken, ['startLine']) || getValue(problem.token, ['startLine']) || 0
		const startColumn = getValue(problem.previousToken, ['startColumn']) || getValue(problem.token, ['startColumn']) || 0
		const endLine = getValue(problem.previousToken, ['endLine']) || getValue(problem.token, ['endLine'])  || textDocument.lineCount;
		const endColumn = getValue(problem.previousToken, ['endColumn']) || getValue(problem.token, ['endColumn'])  || textDocument.positionAt(textDocument.getText.length).character;
		
		let diagnosic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: { line: startLine, character: startColumn },
				end: { line: endLine, character: endColumn }
			},
			message: problem.message,
			source: 'ex'
		};

		if (runtime.hasDiagnosticRelatedInformationCapability) {
			diagnosic.relatedInformation = [
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnosic.range)
					},
					message: 'Spelling matters'
				},
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnosic.range)
					},
					message: 'Particularly for names'
				}
			];
		}
		diagnostics.push(diagnosic);
	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
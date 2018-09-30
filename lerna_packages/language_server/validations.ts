import {
	TextDocument,
	Diagnostic,
	DiagnosticSeverity,
	Connection
} from 'vscode-languageserver';

import './interfaces';
import { BeatParser, BeatLexer, BarFoobar } from 'beat-language-parser'
console.log(BarFoobar);
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
	console.log("RESOURCE: ", textDocument.uri);
	console.log("settings", settings);
	let diagnostics: Diagnostic[] = [];
	let text = textDocument.getText();
	const tokens = BeatLexer.tokenize(text).tokens;

	// The validator creates diagnostics for all uppercase words length 2 and more
	// let pattern = /\b[A-Z]{2,}\b/g;
	// let m: RegExpExecArray;

	const problems: any[] = [];

	try {
		BeatParser.input = tokens;
		BeatParser.tree();

		if (BeatParser.errors.length > 0) {
			for (const error of BeatParser.errors) {
				problems.push(error);
			}
		}
	} catch (err) {
		problems.push(err);
	}

	for (const problem of problems) {
		let diagnosic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(0),
				end: textDocument.positionAt(10)
			},
			message: problem.toString(),
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
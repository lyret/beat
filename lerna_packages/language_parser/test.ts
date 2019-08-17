import { BeatLexer, BeatParser, SyntaxDefinitionPatterns } from './parser';
import { map } from 'lodash';
import { readFileSync, writeFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { createSyntaxDiagramsCode } from 'chevrotain';
import { TextalRepresentationIntepreter } from './source';

// Read the test input file
const Input = readFileSync('test.txt', { encoding: 'UTF-8' });

// Run tests when this file is run directly from node
if (!module.parent) {
	printTokens();
	printTree();
	reinterpretTree();
	saveSyntaxDiagram();
	saveTextMateLanguageJson();
}


function printTokens() {
	const tokens = BeatLexer.tokenize(Input).tokens;
	BeatParser.input = BeatLexer.tokenize(Input).tokens;

	if (BeatParser.errors.length > 0) {
		console.log("\nERRORS:");
		console.log(JSON.stringify(BeatParser.errors, null, 2));
	}
	else {
		console.log("\nTOKENS:");
		console.log(JSON.stringify(map(tokens, token => `${token.image} (${token.tokenType.tokenName})`), null, 2));
	}
}


function printTree() {
	BeatParser.input = BeatLexer.tokenize(Input).tokens;
	const results = BeatParser.createNodeTree();

	if (BeatParser.errors.length > 0) {
		console.log("\nERRORS:");
		console.log(JSON.stringify(BeatParser.errors, null, 2));
	}
	else {
		console.log("\nOBJECT TREE:");
		console.log(JSON.stringify(results, null, 2));
	}
}

function reinterpretTree() {
	BeatParser.input = BeatLexer.tokenize(Input).tokens;
	const results = BeatParser.createNodeTree();

	const intepreter = new TextalRepresentationIntepreter();
	console.log("\nTEXTUAL INTEPRETATION:");
	console.log(intepreter.parse(results));
}


/** Writes a html file describing the current syntax  NOTE: Should be moved from the test parser */
function saveSyntaxDiagram() {
	const outPath = resolvePath(__dirname, "syntax.html");
	const serializedGrammar = BeatParser.getSerializedGastProductions();
	const html = createSyntaxDiagramsCode(serializedGrammar);
	writeFileSync(outPath, html);
}


/** Writes a JSON file that can be used to provide syntax highlitning in code editors. NOTE: Should be moved from the test parser */
function saveTextMateLanguageJson() {
	const packagePath = resolvePath(__dirname, "package.json");
	const { version } = require(packagePath);
	const outPath = resolvePath(__dirname, "beat.tmLanguage.json");

	const tmLanguage = {
		name: "beat language syntax",
		version: version,
		scopeName: "source.beat",
		fileTypes: ["b"],
		patterns: []
	};

	for (const patternId in SyntaxDefinitionPatterns) {
		tmLanguage.patterns.push(SyntaxDefinitionPatterns[patternId]);
	}

	const contents = JSON.stringify(tmLanguage, null, 2).replace(/\\\\/g, '\\');
	writeFileSync(outPath, contents);
}
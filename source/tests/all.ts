import { map } from 'lodash';
import { readFileSync } from 'fs';
import { TextParser } from '../parsers/text';
import { DebugIntepreter } from '../interpreters/debug';

// This file, when executed with node from the terminal, outputs debug information about the testfile 'test.b'
if (!module.parent) {
	console.log("hej")
	const input = readFileSync('test.b', { encoding: 'UTF-8' });
	const parser = new TextParser();
	const { tokens, errors, tree } = parser.parse(input);
	const intepreter = new DebugIntepreter();
	console.log("hej")
	if (errors.length > 0) {
		console.log("\nERRORS:");
		console.log(JSON.stringify(errors, null, 2));
	}
	else {
		console.log("\nTOKENS:");
		console.log(JSON.stringify(map(tokens, token => `${token.image} (${token.tokenType ? token.tokenType.tokenName : 'Unknown Token!'})`), null, 2));

		console.log("\n\nOBJECT TREE:");
		console.log(JSON.stringify(tree, null, 2));

		console.log("\n\nTEXTUAL INTEPRETATION:");
		console.log(intepreter.traverse(tree));
	}
}

// TODO: Should be moved from the test parser to 'document' npm method */
// /** Writes a html file describing the current syntax  
// function saveSyntaxDiagram() {
// 	const outPath = resolvePath(__dirname, "syntax.html");
// 	const serializedGrammar = BeatParser.getSerializedGastProductions();
// 	const html = createSyntaxDiagramsCode(serializedGrammar);
// 	writeFileSync(outPath, html);
// }
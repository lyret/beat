import { map } from 'lodash';
import * as Table from 'table-layout';
import { readFileSync } from 'fs';
import { TextParser } from './parsers/text';
import { DebugIntepreter } from './interpreters/debug';
import { ResolveIntepreter } from './interpreters/resolve';
import { TextIntepreter } from './interpreters/text';
import { NodeComponent } from './classes/components';

// Get the given test argument
const TESTARG = (process.argv[2] || "DEFAULT").toUpperCase() as "DEFAULT" | "COMPONENTS" | "RESOLVER";

// This file, when executed with node from the terminal, outputs debug information about the testfile 'test.b'
if (!module.parent) {
	// Clear the console and print a header
	console.clear();
	console.log("\nBEAT TEST SUIT");
	console.log(`Available tests: components, resolver, default.`);
	console.log(`Test argument: ${TESTARG}.`);
	console.log("\n-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-\n");
	
	// Run the correct test
	switch(TESTARG) {
		case "RESOLVER":
			resolverTest();
			break;
		case "COMPONENTS":
			componentsTest();
			break;
		default:
			primaryInterpretationTest();
			break;
	}

	// Print the footer before the test terminates
	console.log("\n-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-♥︎-\n\n");
}


/** The the node components */
function componentsTest() {

	/** Arrange */
	const textIntepreter = new TextIntepreter();
	const debugIntepreter = new DebugIntepreter();
	const parser = new TextParser();
	const context = new NodeComponent({ _t: "collection", _content: [], _constraints: [{ _optional: false, _t: "constraint", _list: false,  _matches: "any" }] });

	function getDefinition(input: string) : Beat.UnknownNodeWithMetadata {
		const { tokens, errors, tree } = parser.parse(input);
		
		if (errors.length > 0) {
			console.log(JSON.stringify(errors, null, 2));
			throw new Error("ERROR!");
		}
		console.log(JSON.stringify(tree, null, 2))
		return (tree._content[0] as any);
	}

	/** Act */
	const card = context.create({ _t: "collection", _content: [], _assignment: "card" });
	card.create({ _assignment: "name", _t: "empty", _constraints: [{ _t: "constraint", _matches: "string" , _optional: false, _list: false }] });
	card.create({ _assignment: "value", _t: "empty", _constraints: [{ _t: "constraint", _matches: "number" , _optional: false, _list: false }] });
	card.create({ _assignment: "quantity", _t: "leaf", _value: "8",  _tags: ["default"],  _constraints: [{ _t: "constraint", _matches: "number" , _optional: false, _list: false }] });
	
	context.create(getDefinition(`@discard: [
		-> game: { =(..game) } (..game)
		-> card: { =(game.player.hand.#selected) } (game.player.hand.#selected)
		=> [
			...(game)
			player: [ 
				...(game.player)
				hand: [
					{ !=(card) } ...(game.player.hand)
				 ]
			]
			/ re-adds the pile with the discared card on top /
			pile: [
				/ the added card /
				(card)
				/ the rest of the pile /
				...(game.pile.*)
			]
		]
	]`));

	/** Assert */
	const tree = context.view();
	console.log("\DEBUG:");
	console.log(debugIntepreter.traverse(tree));
	console.log("\nTEXT:");
	console.log(textIntepreter.traverse(tree));
}

/** Tests the resolve interpreter */
function resolverTest() {
	const input = readFileSync(`${__dirname}/test.b`, { encoding: 'UTF-8' });
	const parser = new TextParser();
	const { tokens, errors, tree } = parser.parse(input);
	const debugIntepreter = new DebugIntepreter();
	const resolveIntepreter = new ResolveIntepreter();
	const textIntepreter = new TextIntepreter();

	if (errors.length > 0) {
		console.log("\nERRORS:");
		console.log(JSON.stringify(errors, null, 2));
	}
	else {
		const resolvedTree = resolveIntepreter.traverse(tree);

		const table = new Table([{
			original: "ORIGINAL:\n" + textIntepreter.traverse(tree),
			resolved: "RESOLVED:\n" + textIntepreter.traverse(resolvedTree)
		}], { maxWidth: 160 });

		console.log(table.toString());
	}
}


/** Test the general interpreters */
function primaryInterpretationTest() {
	const input = readFileSync(`${__dirname}/assets/test.b`, { encoding: 'UTF-8' });
	const parser = new TextParser();
	const { tokens, errors, tree } = parser.parse(input);
	const debugIntepreter = new DebugIntepreter();
	const textIntepreter = new TextIntepreter();

	if (errors.length > 0) {
		console.log("\nERRORS:");
		console.log(JSON.stringify(errors, null, 2));
	}
	else {
		console.log("\nTOKENS:");
		console.log(JSON.stringify(map(tokens, token => `${token.image} (${token.tokenType ? token.tokenType.tokenName : 'Unknown Token!'})`), null, 2));

		console.log("\n\nOBJECT TREE:");
		console.log(JSON.stringify(tree, null, 2));

		console.log("\n\nDEBUG INTEPRETATION:");
		console.log(debugIntepreter.traverse(tree));

		console.log("\n\TEXT INTEPRETATION:");
		console.log(textIntepreter.traverse(tree));
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
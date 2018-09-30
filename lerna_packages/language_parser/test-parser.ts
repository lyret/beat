console.log("Success");
// import { BeatLexer, BeatParser } from './parser';
// import { map } from 'lodash';
// import { readFileSync, writeFileSync } from 'fs';
// import { resolve as resolvePath } from 'path';
// import { IToken, createSyntaxDiagramsCode } from 'chevrotain';

// function parseTokens(tokens: IToken[]) {
// 	BeatParser.input = tokens;
// 	const results = BeatParser.tree();

// 	console.log("\nTOKENS:");
// 	console.log(JSON.stringify(map(tokens, token => `${token.image} (${token.tokenType.tokenName})`), null, 2));
// 	console.log("\nPARSER RESULTS:");
// 	console.log(JSON.stringify(results, null, 2));
	
// 	if (BeatParser.errors.length > 0) {
// 		console.log("\nERRORS:");
// 		console.log(BeatParser.errors);
// 		//throw new Error("sad sad panda, Parsing errors detected")
// 	}

// 	console.log();
// }

// function saveSyntaxDiagram() {
// 	const outPath = resolvePath(__dirname, "syntax.html");
// 	const serializedGrammar = BeatParser.getSerializedGastProductions();
// 	const html = createSyntaxDiagramsCode(serializedGrammar);
// 	writeFileSync(outPath, html);
// }

// if (!module.parent) {
// 	const inputText = readFileSync('input.txt', { encoding: 'UTF-8' });
// 	const inputTokens = BeatLexer.tokenize(inputText).tokens;
	
// 	parseTokens(inputTokens);
// 	saveSyntaxDiagram();
// }
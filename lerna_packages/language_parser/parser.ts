import { createToken, Lexer, Parser, TokenType } from 'chevrotain';
import { BeatProblem } from './interfaces';

export { BeatProblem } from './interfaces';

const TwiceBrokenLeftCheveron = createToken({ name: "TwiceBrokenLeftCheveron", pattern: /<\/\//, push_mode: "disabledMode", group: Lexer.SKIPPED });
const TwiceBrokenRightCheveron = createToken({ name: "TwiceBrokenRightCheveron", pattern: /\/\/>/, pop_mode: true, group: Lexer.SKIPPED });
const BrokenLeftChevron = createToken({ name: "BrokenLeftChevron", pattern: /<\// });
const BrokenRightChevron = createToken({ name: "BrokenRightChevron", pattern: /\/>/ });
const LeftChevron = createToken({ name: "LeftChevron", pattern: /</ });
const RightChevron = createToken({ name: "RightChevron", pattern: />/ });
const DEFINE = createToken({ name: "DEFINE", pattern: /DEFINE/ });
const Colon = createToken({ name: "Colon", pattern: /:/ });
const Identifier = createToken({ name: "Identifier", pattern: /\w+/ });
const DisabledText = createToken({ name: "Identifier", pattern: /\w+/, group: Lexer.SKIPPED });
const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });

export const LexerDefinition = {
	modes: {
		"default": [
			// Symbols
			TwiceBrokenLeftCheveron,
			BrokenLeftChevron,
			BrokenRightChevron,
			LeftChevron,
			RightChevron,
			Colon,
			// Keywords
			DEFINE,
			// The Identifier must appear after the keywords because all keywords are valid identifiers.
			Identifier,
			// Whitespace
			WhiteSpace
		],
		"disabledMode": [
			TwiceBrokenRightCheveron,
			DisabledText,
			WhiteSpace
		]
	},
	defaultMode: "default"
}

/** Lexer used to identify and create parsable tokens */
export const BeatLexer = new Lexer(LexerDefinition);



export class BeatParserClass extends Parser {

	constructor() {
		super(LexerDefinition.modes.default);
		this.performSelfAnalysis();
	}

	public tree = this.RULE("tree", () => {
		const node = this.SUBRULE(this.node);

		return {
			type: "tree",
			root: node
		}
	});

	public node = this.RULE("node", () => {
		return this.OR([
			{ ALT: () => this.SUBRULE(this.nodeDefinition) },
			{ ALT: () => this.SUBRULE(this.openNode) },
			{ ALT: () => this.SUBRULE(this.simpleNode) },
			{ ALT: () => this.SUBRULE(this.selfClosedNode) }
		]);
	});

	
	private nodeDefinition = this.RULE("nodeDefinition", () => {
		const children: any[] = []

		// 1. Open the node
		this.CONSUME1(LeftChevron);
		this.CONSUME1(DEFINE);
		this.CONSUME1(Colon);
		const startIdentifier = this.CONSUME1(Identifier).image;
		this.CONSUME1(RightChevron);

		// 2. Parse children
		this.OPTION2(() => {
			this.MANY({
				DEF: () => {
					children.push(this.SUBRULE(this.node))
				}
			});
		});
		
		// 3. Close the node, does identifiers match?
		this.CONSUME3(BrokenLeftChevron);
		const endIdentifier = this.OPTION3(() => this.CONSUME3(Identifier).image);
		this.CONSUME3(RightChevron);
		
		if (endIdentifier && startIdentifier != endIdentifier) {
			throw new Error("Missmatch of identifiers");
		}

		// Return
		return {
			type: "definition",
			identifier: startIdentifier,
			children: children.length ? children : null
		};
	});

	private openNode = this.RULE("openNode", () => {
		const children: any[] = []

		// 1. Open the node
		this.CONSUME1(LeftChevron);
		const startIdentifier = this.CONSUME1(Identifier).image;
		this.CONSUME1(RightChevron);

		// 2. Parse children
		this.OPTION2(() => {
			this.MANY({
				DEF: () => {
					children.push(this.SUBRULE(this.node))
				}
			});
		});
		
		// 3. Close the node, does identifiers match?
		this.CONSUME3(BrokenLeftChevron);
		const endIdentifier = this.OPTION3(() => this.CONSUME3(Identifier).image);
		this.CONSUME3(RightChevron);
		
		if (endIdentifier && startIdentifier != endIdentifier) {
			const problem : BeatProblem = {
				name: "Missmatch of identifiers",
				message: `Expected the node '${startIdentifier}' to be closed, but found a closing '${endIdentifier}' identifier instead.`,
				token: {
					image: endIdentifier,
					startOffset: 0,
					endOffset: 0,
					startLine: 0,
					endLine: 0,
					startColumn: 0,
					endColumn: 0
				}
			}

			throw problem;
		}

		// Return
		return {
			identifier: startIdentifier,
			type: "node",
			subtype: "openNode",
			children: children.length ? children : null
		};
	});

	private selfClosedNode = this.RULE("selfClosedNode", () => {
		this.CONSUME(LeftChevron);
		const identifier = this.CONSUME(Identifier).image;
		this.CONSUME(BrokenRightChevron);

		return {
			identifier: identifier,
			type: "node",
			subtype: "selfClosedNode"
		};
	});

	private simpleNode = this.RULE("simpleNode", () => {
		const identifier = this.CONSUME(Identifier).image;
		const children: any[] = []

		this.OPTION(() => {
			this.MANY({
				DEF: () => {
					this.CONSUME(Colon);
					children.push(this.SUBRULE(this.simpleNode));
				},
			});
		});

		return {
			identifier: identifier,
			type: "node",
			subtype: "simpleNode",
			children: children.length ? children : null
		};
	});
}

export const BeatParser = new BeatParserClass();

export const BarFoobar = 1;
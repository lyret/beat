import { createToken, Lexer, Parser, TokenType, ITokenConfig } from 'chevrotain';
import { BeatToken, BeatProblem } from './source';

const TwiceBrokenLeftCheveron = new BeatToken({ name: "TwiceBrokenLeftCheveron", pattern: /<\/\//, push_mode: "disabledMode", group: Lexer.SKIPPED }, { id: "comment-block", type: 'comment', mode: 'begins', inside: true  });
const TwiceBrokenRightCheveron = new BeatToken({ name: "TwiceBrokenRightCheveron", pattern: /\/\/>/, pop_mode: true, group: Lexer.SKIPPED }, { id: "comment-block", type: 'comment', mode: 'ends', inside: true  });
const BrokenLeftChevron = new BeatToken({ name: "BrokenLeftChevron", pattern: /<\// }, { type: "declaration.tag" });
const BrokenRightChevron = new BeatToken({ name: "BrokenRightChevron", pattern: /\/>/ }, { type: "declaration.tag" });
const LeftChevron = new BeatToken({ name: "LeftChevron", pattern: /</ }, { type: "declaration.tag" });
const RightChevron = new BeatToken({ name: "RightChevron", pattern: />/ }, { type: "declaration.tag" });
const SpecificIdentifier = new BeatToken({ name: "SpecificIdentifier", pattern: /@[A-Za-z0-9]+/ }, { type: "keyword" });
const Colon = new BeatToken({ name: "Colon", pattern: /:/ }, { type: "declaration.tag" });
const Identifier = new BeatToken({ name: "Identifier", pattern: /[A-Za-z0-9]+/ }, { type: "variable" });
const StringifiedText = new BeatToken({ name: "StringifiedText", pattern: /\[(.*(?=\]))/ }, { type: 'string' });
const DisabledText = new BeatToken({ name: "DisabledText", pattern: /\w+/, group: Lexer.SKIPPED });
const WhiteSpace = new BeatToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });
const Seperator = new BeatToken({ name: "Seperator", pattern: /[\n\r]/ });

export const SyntaxDefinitionPatterns = BeatToken.SyntaxDefinitionPatterns;

/** Converts a list of BeatTokens to Chevotrain tokens */
const raw = (...tokens : BeatToken[]) => tokens.map((token) => token.Token);

export const LexerDefinition = {
	modes: {
		"default": raw(
			// Symbols
			TwiceBrokenLeftCheveron,
			BrokenLeftChevron,
			BrokenRightChevron,
			LeftChevron,
			RightChevron,
			Colon,
			StringifiedText,
			// Keywords & modifiers
			// none right now
			// The Identifier(s) must appear after the keywords because all keywords are valid identifiers.
			SpecificIdentifier,
			Identifier,
			// Whitespace & others
			Seperator,
			WhiteSpace
		),
		"disabledMode": raw(
			TwiceBrokenRightCheveron,
			DisabledText,
			WhiteSpace
		)
	},
	defaultMode: "default"
}

/** Lexer used to identify and create parsable tokens */
export const BeatLexer = new Lexer(LexerDefinition);



export class BeatParserClass extends Parser {

	constructor() {
		super(LexerDefinition.modes.default, { outputCst: false });
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
			{ ALT: () => this.SUBRULE(this.openNode) },
			{ ALT: () => this.SUBRULE(this.simpleNode) },
			{ ALT: () => this.SUBRULE(this.selfClosedNode) },
			{ ALT: () => this.SUBRULE(this.stringNode) },
			{ ALT: () => this.CONSUME4(Seperator.Token) }
		]);
	});

	private openNode = this.RULE("openNode", () => {
		const children: any[] = []

		// 1. Open the node
		this.CONSUME1(LeftChevron.Token);
		const startIdentifier = this.OR1([
			{ ALT: () => this.CONSUME1(Identifier.Token).image },
			{ ALT: () => this.CONSUME1(SpecificIdentifier.Token).image }
		]);
		this.CONSUME1(RightChevron.Token);

		// 2. Parse children
		this.OPTION2(() => {
			this.MANY({
				DEF: () => {
					children.push(this.SUBRULE(this.node))
				}
			});
		});
		
		// 3. Close the node
		this.CONSUME3(BrokenLeftChevron.Token);
		const endIdentifier = this.OPTION3(() => this.OR3([
			{ ALT: () => this.CONSUME3(Identifier.Token).image },
			{ ALT: () => this.CONSUME3(SpecificIdentifier.Token).image }
		]));
		this.CONSUME3(RightChevron.Token);
		
		// 4. Check that the two identifiers match, otherwise we have a mismatch
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
		this.CONSUME(LeftChevron.Token);
		const identifier = this.OR([
			{ ALT: () => this.CONSUME(Identifier.Token) },
			{ ALT: () => this.CONSUME(SpecificIdentifier.Token) }
		]);
		this.CONSUME(BrokenRightChevron.Token);

		return {
			identifier: identifier,
			type: "node",
			subtype: "selfClosedNode"
		};
	});

	private stringNode = this.RULE("stringNode", () => {
		const data = this.CONSUME(StringifiedText.Token);
		this.OPTION(() => { this.CONSUME(Seperator.Token) });

		return {
			//identifier: data,
			type: "node",
			subtype: "string",
			data: data
		};
	});

	private simpleNode = this.RULE("simpleNode", () => {
		const identifier = this.CONSUME(Identifier.Token).image;
		const children: any[] = []

		this.OPTION(() => {
			this.CONSUME(Colon.Token);
			children.push(this.SUBRULE(this.node));
		});
		
		this.OPTION2(() => { this.CONSUME2(Seperator.Token) });

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
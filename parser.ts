import { createToken, Lexer, Parser, IToken } from 'chevrotain';
import { start } from 'repl';

const TwiceBrokenLeftCheveron = createToken({ name: "TwiceBrokenLeftCheveron", pattern: /<\/\//, push_mode: "disabledMode", group: Lexer.SKIPPED });
const TwiceBrokenRightCheveron = createToken({ name: "TwiceBrokenRightCheveron", pattern: /\/\/>/, pop_mode: true, group: Lexer.SKIPPED });
const BrokenLeftChevron = createToken({ name: "BrokenLeftChevron", pattern: /<\// });
const BrokenRightChevron = createToken({ name: "BrokenRightChevron", pattern: /\/>/ });
const LeftChevron = createToken({ name: "LeftChevron", pattern: /</ });
const RightChevron = createToken({ name: "RightChevron", pattern: />/ });
const Identifier = createToken({ name: "Identifier", pattern: /\w+/ });
const DisabledText = createToken({ name: "Identifier", pattern: /\w+/, group: Lexer.SKIPPED });
const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });

export const LexerDefinition = {
	modes: {
		"default": [
			TwiceBrokenLeftCheveron,
			TwiceBrokenRightCheveron,
			BrokenLeftChevron,
			BrokenRightChevron,
			LeftChevron,
			RightChevron,
			// The Identifier must appear after the keywords because all keywords are valid identifiers.
			Identifier,
			WhiteSpace
		],
		"disabledMode": [
			DisabledText,
			WhiteSpace
		]
	},
	defaultMode: "default"
}

/** Lexer used to identify and create parsable tokens */
export const BeatLexer = new Lexer(LexerDefinition);



export class BeatParserClass extends Parser {

	constructor(input: IToken[]) {
		super(input, LexerDefinition.modes.default);
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
			{ ALT: () => this.SUBRULE(this.selfClosedNode) }
		]);
	});

	private openNode = this.RULE("openNode", () => {
		const children: any[] = []

		this.CONSUME1(LeftChevron);
		const startIdentifier = this.CONSUME1(Identifier).image;
		this.CONSUME1(RightChevron);
		this.OPTION(() => {
			this.MANY({
				DEF: () => {
					children.push(this.SUBRULE(this.node))
				}
			});
		});
		this.CONSUME2(BrokenLeftChevron);
		const endIdentifier = this.CONSUME2(Identifier).image;
		this.CONSUME2(RightChevron);

		if (startIdentifier != endIdentifier) {
			throw new Error("Missmatch of identifiers");
		}

		return {
			type: "node",
			identifier: startIdentifier,
			children: children.length ? children : null
		};
	});

	private selfClosedNode = this.RULE("selfClosedNode", () => {
		this.CONSUME(LeftChevron);
		const identifier = this.CONSUME(Identifier).image;
		this.CONSUME(BrokenRightChevron);

		return {
			type: "node",
			identifier: identifier
		};
	});
}

export const BeatParser = new BeatParserClass([]);
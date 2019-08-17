import { createToken, Lexer, Parser, TokenType, ITokenConfig } from 'chevrotain';
import { BeatProblem } from './problem';
import { BeatSyntaxCongig } from './syntaxConfig';

/**
 * **BeatTokenizer**
 * Allows for the creation of decleration objects
 * that identify how beat syntax tokens should
 * be intepreted and syntax highlighted.
 */
export class BeatTokenizer {
	private static _latestAutomaticSyntaxDefintitionId: number = 0 // TODO: What is this?

	/**
	 * Creates a new Chevrotrain token and at
	 * the same time allow the definition of a text highlight style
	 */
	public static createToken(tokenConfig: ITokenConfig, syntaxConfig?: BeatSyntaxCongig): TokenType {

		// Create a TextMate syntax highlight pattern
		if (syntaxConfig) {
			const id = syntaxConfig.id || String(++BeatTokenizer._latestAutomaticSyntaxDefintitionId)
			const config = BeatTokenizer.SyntaxDefinitionPatterns[id] || {};
			const pattern = tokenConfig.pattern.toString();
			const strippedPattern = pattern.substr(1, pattern.length - 2).split("\\").join("\\\\");
			const patternKey = (!syntaxConfig.mode || syntaxConfig.mode == "contains") ? "match" : syntaxConfig.mode.substr(0, syntaxConfig.mode.length - 1);
			const nameKey = (patternKey != "matches" && syntaxConfig.inside) ? "contentName" : "name";
			config[patternKey] = strippedPattern;
			config[nameKey] = syntaxConfig.type;

			BeatTokenizer.SyntaxDefinitionPatterns[id] = config;
		}

		// Create and return the chevrotrain token
		return createToken(tokenConfig);
	}

	/** 
	 * After all tokens have been constructed, this static property will contain
	 * all the syntax definition patterns needed for constructing the TextMate theme
	 */
	static SyntaxDefinitionPatterns: { [id: string]: object } = {};
}
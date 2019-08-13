import { createToken, Lexer, Parser, TokenType, ITokenConfig } from 'chevrotain';
import { BeatProblem } from './problem';
import { BeatSyntaxCongig } from './syntaxConfig';

/**
 * **BeatToken**
 * Decleration object for how a identifable token of beat language should
 * be intepreted, syntax highlighted and understood in the parser logic
 */
export class BeatToken {
	private static _latestAutomaticSyntaxDefintitionId : number = 0 // TODO: What is this?

	/** 
	 * After all tokens have been constructed, this static property will contain
	 * all the syntax definition patterns needed for constructing the TextMate theme
	 */
	static SyntaxDefinitionPatterns : { [ id : string ] : object } = {};

	private _cachedToken : undefined | TokenType
	private tokenConfig : ITokenConfig
	private syntaxConfig : BeatSyntaxCongig | undefined

	constructor(tokenConfig : ITokenConfig, syntaxConfig? : BeatSyntaxCongig) {
		this.tokenConfig = tokenConfig;
		this.syntaxConfig = syntaxConfig;
		this.addSyntaxEntry();
	}
	public get Token() {
		this._cachedToken = this._cachedToken || createToken(this.tokenConfig);
		return this._cachedToken;
	}

	private addSyntaxEntry() {
		if (!this.syntaxConfig) { return undefined };

		const id = this.syntaxConfig.id || String(++BeatToken._latestAutomaticSyntaxDefintitionId)
		const config = BeatToken.SyntaxDefinitionPatterns[id] || {};
		const pattern = this.tokenConfig.pattern.toString();
		const strippedPattern = pattern.substr(1, pattern.length - 2 );
		const patternKey = (!this.syntaxConfig.mode || this.syntaxConfig.mode == "contains") ? "match" : this.syntaxConfig.mode.substr(0, this.syntaxConfig.mode.length - 1);
		const nameKey = (patternKey != "matches" && this.syntaxConfig.inside) ? "contentName" : "name";
		config[patternKey] = strippedPattern;
		config[nameKey] = this.syntaxConfig.type;

		BeatToken.SyntaxDefinitionPatterns[id] = config;
	}
}
/** 
 * **BeatSyntaxConfig**
 * Configuration object for declering how a interpreted beat token
 * should be highlighted when using the textmate grammer
 */
export interface BeatSyntaxCongig {
	/** (optional) An per scope unique identifier */ id? : string,
	/** (optional) only higlight the inside of matched patterns */ inside? : boolean,
	/** Type of syntax highlight of this scope */ type : SyntaxHighlightName,
	/** Indicates if this token begins, end or scopes the syntax highlight, defaults to contains */ mode? : 'begins' | 'ends' | 'contains'

}

/**
 * A standard syntax highlight identifier supported by most TextMate Themes
 * These can be used to more easily build syntax highlighted tokens
*/
type SyntaxHighlightName = 
"comment" |
"constant" |
"constant.character.escape" |
"constant.language" |
"constant.numeric" |
"declaration.section entity.name.section" |
"declaration.tag" |
"deco.folding" |
"entity.name.function" |
"entity.name.tag" |
"entity.name.type" |
"entity.other.attribute-name" |
"entity.other.inherited-class" |
"invalid" |
"invalid.deprecated.trailing-whitespace" |
"keyword" |
"keyword.control" |
"keyword.control.import" |
"keyword.operator.js" |
"markup.heading" |
"markup.list" |
"markup.quote" |
"meta.embedded" |
"meta.preprocessor" |
"meta.section entity.name.section" |
"meta.tag" |
"storage" |
"storage.type.method" |
"string" |
"string source" |
"string.unquoted" |
"support.class" |
"support.constant" |
"support.function" |
"support.type" |
"support.variable" |
"text source" |
"variable" |
"variable.language" |
"variable.other" |
"variable.parameter"
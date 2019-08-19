import { Lexer, Parser } from 'chevrotain';
import { uniq, values, flatten } from 'lodash';
import { BeatTokenizer } from '../tokenizer';

//#region TOKENS

export const Assignment = BeatTokenizer.createToken({ name: "Assignment", pattern: /\:/ }, { type: "keyword.control" });
export const Tag = BeatTokenizer.createToken({ name: "Tag", pattern: /\#/ }, { type: "keyword.control" });
export const Identifier = BeatTokenizer.createToken({ name: "Identifier", pattern: /[A-Za-z0-9]+/ }, { type: "constant" });
export const Reference = BeatTokenizer.createToken({ name: "Reference", pattern: /[^\)]+/ });
export const Comment = BeatTokenizer.createToken({ name: "Comment", pattern: /\/.*\//, group: Lexer.SKIPPED }, { type: "comment" });
export const LeftBracket = BeatTokenizer.createToken({ name: "LeftBracket", pattern: /\[/ }, { type: "entity.name.tag" });
export const RightBracket = BeatTokenizer.createToken({ name: "RightBracket", pattern: /\]/ }, { type: "entity.name.tag" });
export const LeftCurlyBracket = BeatTokenizer.createToken({ name: "LeftCurlyBracket", pattern: /\{/, push_mode: "ruleMode" }, { type: "meta.tag" });
export const RighCurlyBracket = BeatTokenizer.createToken({ name: "RighCurlyBracket", pattern: /\}/, pop_mode: true, }, { type: "meta.tag" });
export const LeftReferenceBracket = BeatTokenizer.createToken({ name: "LeftReferenceBracket", pattern: /\(/, push_mode: "refMode" }, { type: "entity.name.tag" });
export const RighReferenceBracket = BeatTokenizer.createToken({ name: "RighReferenceBracket", pattern: /\)/, pop_mode: true }, { type: "entity.name.tag" });
export const Equals = BeatTokenizer.createToken({ name: "Equals", pattern: /\=/ }, { type: "keyword.control" })
export const Optional = BeatTokenizer.createToken({ name: "Optional", pattern: /\?/ }, { type: "keyword.control" })
export const Ellipsis = BeatTokenizer.createToken({ name: "Ellipsis", pattern: /\.\.\./ }, { type: "keyword.control" })
export const Grid = BeatTokenizer.createToken({ name: "Grid", pattern: /\:\:/ }, { type: "keyword.control" })
export const L = BeatTokenizer.createToken({ name: "L", pattern: /l/ }, { type: "keyword.control" })
export const Input = BeatTokenizer.createToken({ name: "Input", pattern: /->/ }, { type: "support.variable" })
export const Output = BeatTokenizer.createToken({ name: "Output", pattern: /=[>|=]/ }, { type: "support.variable" })
export const Action = BeatTokenizer.createToken({ name: "Action", pattern: /@/ }, { type: "support.function" })
export const StringType = BeatTokenizer.createToken({ name: "StringType", pattern: /string/ }, { type: "constant.language" })
export const NumberType = BeatTokenizer.createToken({ name: "NumberType", pattern: /number/ }, { type: "constant.language" })
export const BooleanType = BeatTokenizer.createToken({ name: "BooleanType", pattern: /bool/ }, { type: "constant.language" })
export const AnyType = BeatTokenizer.createToken({ name: "AnyType", pattern: /any/ }, { type: "constant.language" })

// TODO: are these tokens needed?
// const TwiceBrokenLeftCheveron = BeatTokenizer.createToken({ name: "TwiceBrokenLeftCheveron", pattern: /<\/\//, push_mode: "disabledMode", group: Lexer.SKIPPED }, { id: "comment-block", type: 'comment', mode: 'begins', inside: true  });
// const TwiceBrokenRightCheveron = BeatTokenizer.createToken({ name: "TwiceBrokenRightCheveron", pattern: /\/\/>/, pop_mode: true, group: Lexer.SKIPPED }, { id: "comment-block", type: 'comment', mode: 'ends', inside: true  });
//const SpecificIdentifier = BeatTokenizer.createToken({ name: "SpecificIdentifier", pattern: /@[A-Za-z0-9]+/ }, { type: "keyword" });
//const DisabledText = BeatTokenizer.createToken({ name: "DisabledText", pattern: /\w+/, group: Lexer.SKIPPED });
// const WhiteSpace = BeatTokenizer.createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });
//const NewLine = BeatTokenizer.createToken({ name: "NewLine", pattern: /[\n\r]/ });
// const SemicolonSeperator = BeatTokenizer.createToken({ name: "SemicolonSeperator", pattern: /\;/ });

//#endregion
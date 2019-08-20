import { Parser, createToken, Lexer } from 'chevrotain';
import { uniq, values, flatten } from 'lodash';

/**
 * **TextParser**
 * Reads text input and converts it to a tree hierachy of Beat node objects.
 * Also contains public utility methods from chevotrain for generating the 
 * current syntax diagram, identifying tokens in a text and so on.
 */
export class TextParser {
	// NOTE: This class should in the future extend an abstract parser class for different type of serialized inputs.

	/** Converts, if possible, the given input to a node object */
	public parse(input: string) : Beat.CollectionNode {
		// NOTE: Create a common interface + generic overload for the result of parsing
		const lexer = InternalTextParser.Lexer;
		const parser = InternalTextParser.Instance;
		const tokens = lexer.tokenize(input).tokens;
		
		parser.input = tokens;

		const tree = parser.createNodeTree();

		return {
			errors: parser.errors,
			tokens: parser.input,
			tree: tree,
		}
	}

	//#region UTILITY METHODS

	/** Creates an interactive syntax diagram in html format for the current syntax for beat text files */
	public generateCurrentSyntaxDiagram() {
		// TODO: Finish, move here from tests
		// TODO: add to "document" npm script
		// const serializedGrammar = BeatParser.getSerializedGastProductions();
		// const html = createSyntaxDiagramsCode(serializedGrammar);
	}
	
	//#endregion
}


// TODO: Document
const Tokens = {
	Assignment: createToken({ name: "Assignment", pattern: /\:/ }),
	Tag: createToken({ name: "Tag", pattern: /\#/ }),
	Identifier: createToken({ name: "Identifier", pattern: /[A-Za-z0-9]+/ }),
	Reference: createToken({ name: "Reference", pattern: /[^\)]+/ }),
	Comment: createToken({ name: "Comment", pattern: /\/.*\//, group: Lexer.SKIPPED }),
	LeftBracket: createToken({ name: "LeftBracket", pattern: /\[/ }),
	RightBracket: createToken({ name: "RightBracket", pattern: /\]/ }),
	LeftCurlyBracket: createToken({ name: "LeftCurlyBracket", pattern: /\{/, push_mode: "ruleMode" }),
	RighCurlyBracket: createToken({ name: "RighCurlyBracket", pattern: /\}/, pop_mode: true, }),
	LeftReferenceBracket: createToken({ name: "LeftReferenceBracket", pattern: /\(/, push_mode: "refMode" }),
	RighReferenceBracket: createToken({ name: "RighReferenceBracket", pattern: /\)/, pop_mode: true }),
	Equals: createToken({ name: "Equals", pattern: /\=/ }),
	Optional: createToken({ name: "Optional", pattern: /\?/ }),
	Ellipsis: createToken({ name: "Ellipsis", pattern: /\.\.\./ }),
	Grid: createToken({ name: "Grid", pattern: /\:\:/ }),
	L: createToken({ name: "L", pattern: /l/ }),
	Input: createToken({ name: "Input", pattern: /->/ }),
	Output: createToken({ name: "Output", pattern: /=[>|=]/ }),
	Action: createToken({ name: "Action", pattern: /@/ }),
	StringType: createToken({ name: "StringType", pattern: /string/ }),
	NumberType: createToken({ name: "NumberType", pattern: /number/ }),
	BooleanType: createToken({ name: "BooleanType", pattern: /bool/ }),
	AnyType: createToken({ name: "AnyType", pattern: /any/ })
	// TODO: are these tokens needed?
	// const TwiceBrokenLeftCheveron = createToken({ name: "TwiceBrokenLeftCheveron", pattern: /<\/\//, push_mode: "disabledMode", group: Lexer.SKIPPED });
	// const TwiceBrokenRightCheveron = createToken({ name: "TwiceBrokenRightCheveron", pattern: /\/\/>/, pop_mode: true, group: Lexer.SKIPPED });
	//const SpecificIdentifier = createToken({ name: "SpecificIdentifier", pattern: /@[A-Za-z0-9]+/ });
	//const DisabledText = createToken({ name: "DisabledText", pattern: /\w+/, group: Lexer.SKIPPED });
	// const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });
	//const NewLine = createToken({ name: "NewLine", pattern: /[\n\r]/ });
	// const SemicolonSeperator = createToken({ name: "SemicolonSeperator", pattern: /\;/ });
}

/**
 * **LexerDefinition**
 * A Chevotrain defininition object that contains
 * the the priority order of tokens that text will identified as.
 */
const LexerDefinition = {
	modes: {
		"default": [
			Tokens.LeftBracket,
			Tokens.RightBracket,
			Tokens.LeftCurlyBracket,
			Tokens.LeftReferenceBracket,
			// Keywords & modifiers
			Tokens.Assignment,
			Tokens.Action,
			Tokens.Tag,
			Tokens.Ellipsis,
			Tokens.Input,
			Tokens.Output,
			// The Identifier(s) must appear after the keywords because all keywords are valid identifiers.
			Tokens.Comment,
			Tokens.Identifier,
		],
		"refMode": [
			Tokens.Reference,
			Tokens.RighReferenceBracket
		],
		"ruleMode": [
			Tokens.Equals,
			Tokens.L,
			Tokens.Grid,
			Tokens.Optional,
			Tokens.StringType,
			Tokens.NumberType,
			Tokens.BooleanType,
			Tokens.AnyType,
			Tokens.LeftReferenceBracket,
			Tokens.RighReferenceBracket,
			Tokens.Identifier,
			Tokens.RighCurlyBracket
		]
	},
	defaultMode: "default"
}

/**
 * **InternalTextParser**
 * Chevotrain parser implementation for converting lexified text input
 * to a tree hierarchy of node objects. This class is used internaly
 * by the publicly exported TextParser that adheres to the common Beat
 * interface for parsing serialized input to node objects.
 */
class InternalTextParser extends Parser {
	
	/** 
	 * Reusable singleton instance of the chevotrain parser
	 * Only a single instance of the parser is needed
	 * as any new input will reset it.
	*/
	public static Instance = new InternalTextParser();

	/**
	 * Reusable chevotrain lexer instance with the given lexer definition
	 */
	public static Lexer = new Lexer(LexerDefinition);

	constructor() {
		// Set up chevrotrain configuration for the parser
		// The first value passed is all unique tokens defined in the LexerDefinition
		super(uniq(flatten(values(LexerDefinition.modes))), { outputCst: false });
		this.performSelfAnalysis();
	}

	//#region PUBLIC METHODS

	/** Returns a nested tree of beat nodes from the given lexified text input */
	public createNodeTree(): Beat.CollectionNode {
		return this.document();
	}

	//#endregion


	// #region INTERNAL METHODS
	// Internal methods used for cleaning up and returning optimized
	// nodes and related values, also used for improved the readability of rules
	// TODO: remove or re-add in some form? 

	/** Creates a new node node */
	// private NODE<T extends Node>(_t: T['_t'], options: Partial<T>): T {

	// }

	// /** Creates a cleaned up list of beat nodes */
	// private LIST(list: Array<OLD_BeatNode>): Array<OLD_BeatNode> | undefined {
	// 	list = filter(list, entry => entry != undefined);
	// 	if (!list.length) {
	// 		return undefined;
	// 	}
	// 	return list;
	// }

	// /** Creates a reference node from a given path and optional options */
	// private REFERENCE(path: string, options: Partial<ReferenceNode> = {}): ReferenceNode {
	// 	return {
	// 		_t: "reference",
	// 		...options,
	// 		_path: path
	// 	};
	// }

	// /** Creates a constraints node */
	// private CONSTRAINT(constraint: Partial<ContstraintsNode>): ContstraintsNode {
	// 	return {
	// 		_t: "constraint",
	// 		_matches: "any",
	// 		_list: false,
	// 		_optional: false,
	// 		...constraint
	// 	};
	// }

	// /** Creates a tag */
	// private TAG(tag: Tag) {
	// 	return tag;
	// }


	// TODO: this is how we used to throw problems, keep?
	// // 4. Check that the two identifiers match, otherwise we have a mismatch
	// if (endIdentifier && startIdentifier != endIdentifier) {
	// 	const problem : BeatProblem = {
	// 		name: "Missmatch of identifiers",
	// 		message: `Expected the node '${startIdentifier}' to be closed, but found a closing '${endIdentifier}' identifier instead.`,
	// 		token: {
	// 			image: endIdentifier,
	// 			startOffset: 0,
	// 			endOffset: 0,
	// 			startLine: 0,
	// 			endLine: 0,
	// 			startColumn: 0,
	// 			endColumn: 0
	// 		}
	// 	}

	// 	throw problem;
	// }

	//#endregion

	// #region PARSER RULES
	// These methods are chevotrain rules
	// used to traverse the inputed lexer tokens
	// and outputing a tree of beat nodes

	/** This is the first rule called from the exposed public method when parsing a document */
	private document = this.RULE<Beat.NodeWithMetadata & Beat.CollectionNode>("tree", () => {
		const _constraints: Array<Beat.ContstraintsNode> = [];

		// Get any constraints in top of the document
		this.OPTION2(() => _constraints.push(this.SUBRULE2(this.constraint)));

		// Find any nodes in the given input
		const nodes: Array<Beat.NodeWithMetadata> = [];
		this.MANY1(() => {
			nodes.push(this.SUBRULE1(this.node));
		});

		// Return the node tree as a collection
		return ({
			_t: "collection",
			_assignment: "root",
			_constraints,
			_expanded: false,
			_tags: [],
			_content: nodes,
		});
	});

	/** Identifies a node of any type and add metadata to it */
	private node = this.RULE<Beat.NodeWithMetadata>("node", () => {

		// Create a default metadata object to modify
		const metadata: Beat.Metadata = {};

		// Get the assigned path to this node, if any
		this.OPTION1(() => metadata._assignment = this.SUBRULE1(this.assignment));

		// Get the constraints on this node, if any
		this.OPTION2(() => metadata._constraints = [this.SUBRULE2(this.constraint)]);

		// Determine if this node should be expanded
		// Only possible if the node does not have an assignment
		if (!metadata._assignment) {
			this.OPTION3(() => metadata._expanded = this.SUBRULE3(this.expansion));
		}

		// Consume any one type of node
		const node: Beat.Node = this.OR4([
			{ ALT: () => this.SUBRULE4(this.actionNode) },
			{ ALT: () => this.SUBRULE4(this.collectionNode) },
			{ ALT: () => this.SUBRULE4(this.emptyNode) },
			{ ALT: () => this.SUBRULE4(this.leafNode) },
			{ ALT: () => this.SUBRULE4(this.reference) },
		]);

		// Identify any tags at this node
		this.MANY5(() => {
			metadata._tags.push(this.SUBRULE5(this.tag));
		});

		// Return a node with added metadata
		return ({ ...node, ...metadata });
	});

	/** Identifies a node with a collection of children */
	private collectionNode = this.RULE<Beat.CollectionNode>("collectionNode", () => {

		// Create a default node to modify
		const node: Beat.CollectionNode = {
			_t: "collection",
			_content: []
		}

		// Open the node decleration
		this.CONSUME1(Tokens.LeftBracket);

		// Add child nodes
		this.AT_LEAST_ONE2(() => {
			const child = this.SUBRULE2(this.node);
			node._content.push(child);
		});

		// Close the node decleration
		this.CONSUME3(Tokens.RightBracket);

		// Return the node
		return (node);
	});

	/** Identifies a node without any content */
	private emptyNode = this.RULE<Beat.EmptyNode>("emptyNode", () => {

		// Create a default node to modify
		const node: Beat.EmptyNode = {
			_t: "empty"
		}

		// Open the node decleration
		this.CONSUME1(Tokens.LeftBracket);

		// Close the node decleration
		this.CONSUME2(Tokens.RightBracket);

		// Return the node
		return (node);
	});

	/** Identifies a node without brackets and without further content */
	private leafNode = this.RULE<Beat.LeafNode>("leafNode", () => {

		// Get the value of the leaf node
		const token = this.CONSUME(Tokens.Identifier);

		// Return the node
		return ({ _t: "leaf", _value: token.image });
	});

	/** Identifies an action node that can be invoked later */
	private actionNode = this.RULE<Beat.ActionNode>("actionNode", () => {

		// Create a default node to modify
		const node: Beat.ActionNode = {
			_t: "action",
			_name: "",
			_inputs: [],
			_output: { _t: "empty" }
		}

		// Consume the action operator symbol
		this.CONSUME1(Tokens.Action);

		// An action node must be assigned a name
		this.OPTION2(() => node._name = this.SUBRULE2(this.assignment));

		// Open the node decleration
		this.CONSUME3(Tokens.LeftBracket);

		// Add any and all input nodes
		this.MANY4(() => {
			const child = this.SUBRULE4(this.inputNode);
			node._inputs.push(child);
		});

		// Consume the output symbol
		this.CONSUME4(Tokens.Output);

		// Consume the output node, can be eithar a leaf, collection or empty node
		node._output = this.OR5([
			{ ALT: () => this.SUBRULE5(this.leafNode) },
			{ ALT: () => this.SUBRULE5(this.collectionNode) },
			{ ALT: () => this.SUBRULE5(this.emptyNode) }
		]);

		// Close the node decleration
		this.CONSUME6(Tokens.RightBracket);

		// Return the node
		return (node);
	});

	/** Identifies a node that is used as an action input */
	private inputNode = this.RULE<Beat.InputNode>("inputNode", () => {

		// Create a default input node to modify
		const node: Beat.InputNode = {
			_t: "input",
			_assignment: "",
			_constraints: [],
			_value: { _t: "empty" }
		}

		// Consume the input symbol
		this.CONSUME1(Tokens.Input);

		// Get the assigned path of the input
		node._assignment = this.SUBRULE2(this.assignment);

		// Consume the constrains for this input, if any
		this.OPTION3(() => node._constraints.push(this.SUBRULE3(this.constraint)));

		// Get the value of the input node
		node._value = this.SUBRULE4(this.node);

		// Return the node
		return (node);
	});

	/** Identifies a reference node, can be used both in rules and in nodes */
	private reference = this.RULE<Beat.ReferenceNode>("reference", () => {

		// Open the reference decleration
		this.CONSUME1(Tokens.LeftReferenceBracket)

		// Get the reference path
		const token = this.CONSUME2(Tokens.Reference);

		// Close the refernce decleration
		this.CONSUME3(Tokens.RighReferenceBracket)

		// Return the node
		return ({ _t: "reference", _path: token.image });
	});

	/** Identifies a constraint added on a node */
	private constraint = this.RULE<Beat.ContstraintsNode>("constraint", () => {
		// NOTE: At this time it is only possible to identify a single constraint
		// using this rule, multiple constraints should be possilbe in the future

		// Create a default constraint to modify
		const constraint: Beat.ContstraintsNode = {
			_t: "constraint",
			_matches: "any",
			_list: false,
			_optional: false
		};

		// Open the constraints decleration
		this.CONSUME1(Tokens.LeftCurlyBracket)

		// Identify if this is a list constraint or not
		this.OR2([
			{ ALT: () => { this.CONSUME2(Tokens.Equals); constraint._list = false; } },
			{ ALT: () => { this.CONSUME2(Tokens.Grid); constraint._list = true; } },
			{ ALT: () => { this.CONSUME2(Tokens.L); constraint._list = true; } }
		])

		// Identify the specific match property of this contraint
		this.OR3([
			{ ALT: () => { this.CONSUME3(Tokens.StringType); constraint._matches = "string"; } },
			{ ALT: () => { this.CONSUME3(Tokens.NumberType); constraint._matches = "number"; } },
			{ ALT: () => { this.CONSUME3(Tokens.BooleanType); constraint._matches = "bool"; } },
			{ ALT: () => { this.CONSUME3(Tokens.AnyType); constraint._matches = "any"; } },
			{
				ALT: () => {
					constraint._matches = this.SUBRULE3(this.reference)
				}
			}
		]);

		// Identify if this constraint is optional or not
		this.OPTION4(() => { this.CONSUME4(Tokens.Optional); constraint._optional = true; })

		// Close the constraint decleration
		this.CONSUME5(Tokens.RighCurlyBracket)

		// Return the node
		return (constraint)
	});

	/** Identifies a tag added to a node */
	private tag = this.RULE<string>("tag", () => {

		// Check that this is a tag
		this.CONSUME1(Tokens.Tag);

		// Get the textual name of the tag
		const token = this.CONSUME2(Tokens.Identifier);

		// Returns the tag
		return (token.image);
	});

	/** Identifies a named path assignment to a node */
	private assignment = this.RULE<string>("assignment", () => {

		// Get the identifier of the assignment
		const token = this.CONSUME1(Tokens.Identifier);

		// Consume the assignment operator
		this.CONSUME2(Tokens.Assignment);

		// Return the assigned path
		return (token.image);
	});

	/** Identifies that a node should be expanded */
	private expansion = this.RULE<boolean>("expansion", () => {

		// Consume the expand operator
		this.CONSUME1(Tokens.Ellipsis);

		// Return true if it should be expanded
		return (true);
	});

	//#endregion
}
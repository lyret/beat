import { Lexer, Parser } from 'chevrotain';
import { uniq, values, flatten } from 'lodash';
import { BeatTokenizer } from '../tokenizer';
import * as Tokens from './tokens';

//#region LEXER

/**
 * **LexerDefinition**
 * Defines the priority order of tokens that text
 * will identified as.
 */
export const LexerDefinition = {
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

//#endregion

//#region PARSER

/**
 * **BeatParser**
 * Creates a nested beat object tree from a given input of identifable tokens.
 */
class BeatParserClass extends Parser {
	constructor() {
		// Set up chevrotrain configuration for the parser
		// The first value passed is all unique tokens defined in the LexerDefinition
		super(uniq(flatten(values(LexerDefinition.modes))), { outputCst: false });
		this.performSelfAnalysis();
	}

	//#region PUBLIC METHODS

	/** Returns a nested tree of beat nodes from the given lexified text input */
	public createNodeTree(): CollectionNode {
		return this.document();
	}

	//#endregion


	// #region INTERNAL METHODS
	// Internal methods used for cleaning up and returning optimized
	// nodes and related values, also used for improved the readability of rules

	/** Creates a new node node */
	// private NODE<T extends Node>(_t: T['_t'], options: Partial<T>): T {

	// }
	// TODO: remove or re-add in some form? 

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

	//#endregion

	// #region PARSER RULES
	// These methods are chevotrain rules
	// used to traverse the inputed lexer tokens
	// and outputing a tree of beat nodes

	/** This is the first rule called from the exposed public method when parsing a document */
	private document = this.RULE<NodeWithMetadata & CollectionNode>("tree", () => {
		const _constraints: Array<ContstraintsNode> = [];

		// Get any constraints in top of the document
		this.OPTION2(() => _constraints.push(this.SUBRULE2(this.constraint)));

		// Find any nodes in the given input
		const nodes: Array<NodeWithMetadata> = [];
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
	private node = this.RULE<NodeWithMetadata>("node", () => {

		// Create a default metadata object to modify
		const metadata: Metadata = {};

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
		const node: Node = this.OR4([
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
	private collectionNode = this.RULE<CollectionNode>("collectionNode", () => {

		// Create a default node to modify
		const node: CollectionNode = {
			_t: "collection",
			_content: []
		}

		// Open the node decleration
		this.CONSUME1(LeftBracket);

		// Add child nodes
		this.AT_LEAST_ONE2(() => {
			const child = this.SUBRULE2(this.node);
			node._content.push(child);
		});

		// Close the node decleration
		this.CONSUME3(RightBracket);

		// Return the node
		return (node);
	});

	/** Identifies a node without any content */
	private emptyNode = this.RULE<EmptyNode>("emptyNode", () => {

		// Create a default node to modify
		const node: EmptyNode = {
			_t: "empty"
		}

		// Open the node decleration
		this.CONSUME1(LeftBracket);

		// Close the node decleration
		this.CONSUME2(RightBracket);

		// Return the node
		return (node);
	});

	/** Identifies a node without brackets and without further content */
	private leafNode = this.RULE<LeafNode>("leafNode", () => {

		// Get the value of the leaf node
		const token = this.CONSUME(Identifier);

		// Return the node
		return ({ _t: "leaf", _value: token.image });
	});

	/** Identifies an action node that can be invoked later */
	private actionNode = this.RULE<ActionNode>("actionNode", () => {

		// Create a default node to modify
		const node: ActionNode = {
			_t: "action",
			_name: "",
			_inputs: [],
			_output: { _t: "empty" }
		}

		// Consume the action operator symbol
		this.CONSUME1(Action);

		// An action node must be assigned a name
		this.OPTION2(() => node._name = this.SUBRULE2(this.assignment));

		// Open the node decleration
		this.CONSUME3(LeftBracket);

		// Add any and all input nodes
		this.MANY4(() => {
			const child = this.SUBRULE4(this.inputNode);
			node._inputs.push(child);
		});

		// Consume the output symbol
		this.CONSUME4(Output);

		// Consume the output node, can be eithar a leaf, collection or empty node
		node._output = this.OR5([
			{ ALT: () => this.SUBRULE5(this.leafNode) },
			{ ALT: () => this.SUBRULE5(this.collectionNode) },
			{ ALT: () => this.SUBRULE5(this.emptyNode) }
		]);

		// Close the node decleration
		this.CONSUME6(RightBracket);

		// Return the node
		return (node);
	});

	/** Identifies a node that is used as an action input */
	private inputNode = this.RULE<InputNode>("inputNode", () => {

		// Create a default input node to modify
		const node: InputNode = {
			_t: "input",
			_assignment: "",
			_constraints: [],
			_value: { _t: "empty" }
		}

		// Consume the input symbol
		this.CONSUME1(Input);

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
	private reference = this.RULE<ReferenceNode>("reference", () => {

		// Open the reference decleration
		this.CONSUME1(LeftReferenceBracket)

		// Get the reference path
		const token = this.CONSUME2(Reference);

		// Close the refernce decleration
		this.CONSUME3(RighReferenceBracket)

		// Return the node
		return ({ _t: "reference", _path: token.image });
	});

	/** Identifies a constraint added on a node */
	private constraint = this.RULE<ContstraintsNode>("constraint", () => {
		// NOTE: At this time it is only possible to identify a single constraint
		// using this rule, multiple constraints should be possilbe in the future

		// Create a default constraint to modify
		const constraint: ContstraintsNode = {
			_t: "constraint",
			_matches: "any",
			_list: false,
			_optional: false
		};

		// Open the constraints decleration
		this.CONSUME1(LeftCurlyBracket)

		// Identify if this is a list constraint or not
		this.OR2([
			{ ALT: () => { this.CONSUME2(Equals); constraint._list = false; } },
			{ ALT: () => { this.CONSUME2(Grid); constraint._list = true; } },
			{ ALT: () => { this.CONSUME2(L); constraint._list = true; } }
		])

		// Identify the specific match property of this contraint
		this.OR3([
			{ ALT: () => { this.CONSUME3(StringType); constraint._matches = "string"; } },
			{ ALT: () => { this.CONSUME3(NumberType); constraint._matches = "number"; } },
			{ ALT: () => { this.CONSUME3(BooleanType); constraint._matches = "bool"; } },
			{ ALT: () => { this.CONSUME3(AnyType); constraint._matches = "any"; } },
			{
				ALT: () => {
					constraint._matches = this.SUBRULE3(this.reference)
				}
			}
		]);

		// Identify if this constraint is optional or not
		this.OPTION4(() => { this.CONSUME4(Optional); constraint._optional = true; })

		// Close the constraint decleration
		this.CONSUME5(RighCurlyBracket)

		// Return the node
		return (constraint)
	});

	/** Identifies a tag added to a node */
	private tag = this.RULE<string>("tag", () => {

		// Check that this is a tag
		this.CONSUME1(Tag);

		// Get the textual name of the tag
		const token = this.CONSUME2(Identifier);

		// Returns the tag
		return (token.image);
	});

	/** Identifies a named path assignment to a node */
	private assignment = this.RULE<string>("assignment", () => {

		// Get the identifier of the assignment
		const token = this.CONSUME1(Identifier);

		// Consume the assignment operator
		this.CONSUME2(Assignment);

		// Return the assigned path
		return (token.image);
	});

	/** Identifies that a node should be expanded */
	private expansion = this.RULE<boolean>("expansion", () => {

		// Consume the expand operator
		this.CONSUME1(Ellipsis);

		// Return true if it should be expanded
		return (true);
	});

	//#endregion
}

//#endregion

// Export usable objects
// Only singleton implementation of the parser class
// is needed as any new input will reset the parser

/** 
 * **BeatLexer**
 * Used to identify and create parsable tokens.
 */
export const BeatLexer = new Lexer(LexerDefinition);

/**
 * **BeatParser**
 * Creates a nested BeatNode object tree from identified tokens.
 */
export const BeatParser = new BeatParserClass();


// TODO: document, move? what is this?
export const SyntaxDefinitionPatterns = BeatTokenizer.SyntaxDefinitionPatterns;

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
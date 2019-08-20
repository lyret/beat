
/**
 * **Beat**
 * Contains interfaces for the nestable object types
 * created by parsing beat files known as 'nodes' and related
 * types.
 * These declerations can be used in any typescript
 * implementation related to the beat language.
 */
declare namespace Beat {

	/** A primary type */
	type Primary = "string" | "number" | "bool" | "any";

	/** A type of node object */
	type Type = "collection" | "reference" | "leaf" | "empty" | "constraint" | "action" | "input" | "output";

	/** A Node with added metadata */
	type NodeWithMetadata = Node & Metadata;

	/** A basic node object of unknown type */
	interface Node {
		/** The identified type of node */
		_t: Type
	}

	/** Metadata that can be added to any node, not all values are available in all circumstances */
	interface Metadata {
		/** The assigned path name of this node if added, used for path finding */
		_assignment?: string
		/** List of tags added to this node */
		_tags?: Array<string>
		/** Any constraints that must be matched by child content added to this node */
		_constraints?: Array<ContstraintsNode>
		/** Indicates that this node should be merged with its parent node */
		_expanded?: boolean
	}

	/** A Node with several collected child nodes */
	interface CollectionNode extends Node {
		_t: "collection"

		/** Contained children nodes in this node */
		_content: Array<Node>
	}

	/** A node with a single value and no further child nodes */
	interface LeafNode extends Node {
		_t: "leaf"

		/** The value of this node */
		_value: string
	}

	/** An empty node without value or children */
	interface EmptyNode extends Node {
		_t: "empty"
	}

	/** A node that declerares a reference to another node in the object hierarchy */
	interface ReferenceNode extends Node {
		_t: "reference"

		/** The path to the referenced node */
		_path: string
	}

	/** A decleration of an action that can be invoked later */
	interface ActionNode extends Node {
		_t: "action"

		/** The unique name of the action */
		_name: string
		/** Inputs declered on the action, needs to be non empty when the action is called */
		_inputs: Array<InputNode>
		/** The output of this action when invoked */
		_output: CollectionNode | EmptyNode | LeafNode
	}

	/** A node that resolves to references or values when the action is invoked */
	interface InputNode extends Node {
		_t: "input"

		/** The assigned path name of this input, must be added to inputs */ // TODO: should be optional, function as gates if not assigned
		_assignment: string
		/** Constraints added to this input, must be matched for the action to be invoked */
		_constraints: Array<ContstraintsNode>
		_value: Node
	}

	/** A constraint is a special node added as metadata to any node, it functions as a filter for node content */
	interface ContstraintsNode extends Node {
		_t: "constraint"

		/** Must match the given type of primary, or a given reference node */
		_matches: Primary | ReferenceNode
		/** Indicates an optional contraint, nodes must match or be left empty */
		_optional: boolean
		/** Indiciates that the node must be a collection of the given constraint instead of matching its own content */
		_list: boolean
	}

	// TODO: Lacks documentation, is unused
	/**
	 * Common interface for problems
	 * identified in the parsing of text content
	 * for making sure that errors/warnings can be respresented correctly
	 * independent on the user enviornment.
	 */
	export interface Problem {
		name: string,
		message: string
		token: {
			image?: string
			startOffset: number
			endOffset: number
			startLine: number
			endLine: number
			startColumn: number
			endColumn: number
			tokenTypeIdx?: number
			tokenType?: any
		}
		previousToken?: any
	}
}
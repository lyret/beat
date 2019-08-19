import { resolve } from "dns";

/**
 * **BeatNode**
 * Nestable interface that represents
 * a parsed beat source as a javascript object
 */
export interface OLD_BeatNode {
	/** 
	 * The type of identified node
	 */
	_t: NodeType
	/** The assigned name of this node */
	name?: string
	/** The stringified value of this node, if its a leaf node */
	value?: string
	/** Any tags added to this node */
	tags?: Array<string>
	/** This node will be expanded into its parents node */
	expand?: boolean
	/** Indiciates that this node is a reference, value will contain the path to the referenced node */
	reference?: OLD_NodeReference
	/** Child nodes from this node */
	children?: Array<OLD_BeatNode>
	/** A single underlying node child is added as 'model' for clarity */
	model?: OLD_BeatNode
	/** Any constraint (rules) that must be matched by children and the model node */
	constraint?: OLD_NodeContstraint
}


export interface OLD_NodeContstraint {
	/** This node is optional, must match the following rules or be left empty */
	optional?: boolean
	/** Must match the given primary type, or a match a referenced node */
	matches?: PrimaryType | "reference"
	/** If matches is "reference" this will contain the referenced node */
	reference?: OLD_NodeReference
	/** Indiciates that this node must contain a list of the type of node indicated by 'matches' */
	list?: boolean
}

export interface OLD_NodeReference {
	/** The given path to the referenced node */
	path: string
}

// UNDOCUMENTED BEAT INTERFACES
// TODO: document

export type NodeType = "collection" | "reference" | "leaf" | "empty" | "constraint" | "action" | "input" | "output";
export type PrimaryType = "string" | "number" | "bool" | "any";

export type NodeWithMetadata = Node & Metadata;

export interface Node {
	/** The identified type of node */
	_t: NodeType
}

export interface Metadata {
	/** The assigned path name of this node if added, used for path finding */
	_assignment?: string
	/** List of tags added to this node */
	_tags?: Array<string>
	/** Any constraints that must be matched by child content added at this node */
	_constraints?: Array<ContstraintsNode>
	/** Indicates that this nodes content should be expanded into its parent node */
	_expanded?: boolean
}

export interface CollectionNode extends Node {
	_t: "collection"
	/** Contained children nodes in this node */
	_content: Array<Node>
}

export interface LeafNode extends Node {
	_t: "leaf"
	_value: string
}

export interface EmptyNode extends Node {
	_t: "empty"
}

export interface ReferenceNode extends Node {
	_t: "reference"
	// TODO: reference nodes should not have names
	_path: string
}

export interface ActionNode extends Node {
	_t: "action"
	_name: string
	_inputs: Array<InputNode>
	_output: CollectionNode | EmptyNode | LeafNode
}

export interface InputNode extends Node {
	_t: "input"
	_assignment: string,
	_constraints: Array<ContstraintsNode>
	_value: Node
}

export interface ContstraintsNode extends Node {
	_t: "constraint"
	/** Must match the given primary type, or a match a given reference node */
	_matches: PrimaryType | ReferenceNode
	/** Indicates an optional contraint, nodes must match or be left empty */
	_optional: boolean
	/** Indiciates that this node must contain a list of the type of node indicated by 'matches' */
	_list: boolean
}

abstract class AbstractBeatObjectIntepreter<OutputData, InternalData = OutputData> {
	/** Parses a given root node object */
	public parse(/* The object to interpret */ root: Node): OutputData {
		return this.atNode(root) as any as OutputData;
	}

	protected atNode(node: Node): InternalData {
		switch (node._t) {
			case "collection":
				return this.atCollection(node as CollectionNode, node as Metadata);
			case "empty":
				return this.atEmpty(node as EmptyNode, node as Metadata);
			case "leaf":
				return this.atLeaf(node as LeafNode, node as Metadata);
			case "action":
				return this.atAction(node as ActionNode, node as Metadata);
			case "input":
				return this.atInput(node as InputNode, node as Metadata);
			case "constraint":
				return this.atConstraint(node as ContstraintsNode, node as Metadata);
			case "reference":
				return this.atReference(node as ReferenceNode, node as Metadata);
			default:
				// Unknown node
				throw new Error("unknown node type"); // NOTE: better error handling here
		}
	}

	protected abstract atCollection(node: CollectionNode, metadata?: Metadata): InternalData
	protected abstract atEmpty(node: EmptyNode, metadata?: Metadata): InternalData
	protected abstract atLeaf(node: LeafNode, metadata?: Metadata): InternalData
	protected abstract atAction(node: ActionNode, metadata?: Metadata): InternalData
	protected abstract atInput(node: InputNode, metadata?: Metadata): InternalData
	protected abstract atConstraint(node: ContstraintsNode, metadata?: Metadata): InternalData
	protected abstract atReference(node: ReferenceNode, metadata?: Metadata): InternalData
}


export class TextalRepresentationIntepreter extends AbstractBeatObjectIntepreter<string, string> {
	private inset: number = 1;

	private get prefix(): string {
		return Array(this.inset).join("   |");
	}

	protected atCollection(node: CollectionNode, metadata: Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += ` :${this.prefix}contents:\n`;
		node._content.forEach(child => res += this.atChild(child));
		return (res);
	}

	protected atEmpty(node: EmptyNode, metadata: Metadata) {
		let res = this.atMetadata(node._t, metadata);
		return (res);
	}

	protected atLeaf(node: LeafNode, metadata: Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += `v:${this.prefix}${(node._value)}\n`;
		return (res);
	}

	protected atAction(node: ActionNode, metadata: Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += `n:${this.prefix}${(node._name)}\n`;
		node._inputs.forEach(child => res += this.atChild(child));
		res += ` :${this.prefix}==\n`;
		res += this.atNode(node._output);
		return (res);
	}

	protected atInput(node: InputNode, metadata: Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += ` :${this.prefix}->\n`;
		res += this.atChild(node._value);
		return (res);
	}

	protected atConstraint(node: ContstraintsNode) {
		const { _list, _matches, _optional } = node;
		let res = `c:${this.prefix}${_list ? "list of" : "matching"} ${(typeof _matches === "string") ? _matches : _matches._path} ${_optional ? "(optional)" : ""}\n`;
		return (res);
	}

	protected atReference(node: ReferenceNode, metadata: Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += `r:${this.prefix}reference to: ${node._path}\n`;
		return (res);
	}

	/** Wrapper for increasing the inset when moving down the tree hiarchy */
	protected atChild(node: Node) : string {
		this.inset+=1;
		let res = this.atNode(node);
		this.inset-=1;
		return (res);
	}

	/** Outputs a string for the metadata at any given node */

	protected atMetadata(type: NodeType, metadata: Metadata): string {
		const { _expanded, _constraints, _assignment, _tags } = metadata;
		const headlinePrefix = `${Array(this.inset).join("___|")}`
		let res = "";

		// Add the headline
		res += ` :${headlinePrefix}${type}${_expanded ? "(expanding)" : ""}\n`;

		// Assigned path
		if (_assignment) {
			res += `a:${this.prefix}${(_assignment.toUpperCase())}\n`;
		}

		// Add constraint info
		if (_constraints && _constraints.length) {
			_constraints.forEach(constraint => res += this.atConstraint(constraint));
		}

		// Tags
		if (_tags && _tags.length) {
			res += `t:${this.prefix}#${_tags.join(' #')}\n`;
		}

		return (res);
	}
}
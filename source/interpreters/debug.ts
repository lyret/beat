import { Beat } from "../interfaces/beat";
import { Intepreter } from "./abstract";

/**
 * **DebugIntepreter**
 * A simple intepreter that traverses a object hierachy and creates an extensive textual
 * representation for debugging/developing purposes.
 */
export class DebugIntepreter extends Intepreter<string, string> {
	private padding: number = 1;

	/** Creates a string prefix for padding the output row from the left */
	private get prefix(): string {
		return Array(this.padding).join("   |");
	}

	protected atCollection(node: Beat.CollectionNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += ` :${this.prefix}contents:\n`;
		node._content.forEach(child => res += this.atChild(child));
		return (res);
	}

	protected atEmpty(node: Beat.EmptyNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		return (res);
	}

	protected atLeaf(node: Beat.LeafNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += `v:${this.prefix}${(node._value)}\n`;
		return (res);
	}

	protected atAction(node: Beat.ActionNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += `n:${this.prefix}${(node._name)}\n`;
		node._inputs.forEach(child => res += this.atChild(child));
		res += ` :${this.prefix}==\n`;
		res += this.atNode(node._output);
		return (res);
	}

	protected atInput(node: Beat.InputNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += ` :${this.prefix}->\n`;
		res += this.atChild(node._value);
		return (res);
	}

	protected atConstraint(node: Beat.ContstraintsNode) {
		const { _list, _matches, _optional } = node;
		let res = `c:${this.prefix}${_list ? "list of" : "matching"} ${(typeof _matches === "string") ? _matches : _matches._path} ${_optional ? "(optional)" : ""}\n`;
		return (res);
	}

	protected atReference(node: Beat.ReferenceNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += `r:${this.prefix}reference to: ${node._path}\n`;
		return (res);
	}

	/** Utility wrapper call arount atNode for increasing the padding when moving down the tree hierarchy */
	protected atChild(node: Beat.Node) : string {
		this.padding+=1;
		let res = this.atNode(node);
		this.padding-=1;
		return (res);
	}

	/** Outputs a string for the metadata at any given node */
	protected atMetadata(type: Beat.Type, metadata: Beat.Metadata): string {
		const { _expanded, _constraints, _assignment, _tags } = metadata;
		const headlinePrefix = `${Array(this.padding).join("___|")}`
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
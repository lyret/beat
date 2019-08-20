import { Beat } from "../interfaces/beat";
import { Intepreter } from "./abstract";

/**
 * **TextIntepreter**
 * TODO: Document
 * TODO: Does not include line breaks
 * TODO: Does not respect single lined collections with ;
 * TODO: Does not include comments
 */
export class TextIntepreter extends Intepreter<string, string> {
	private padding: number = 1;
	private breaklines: boolean = true;

	/** Creates a string prefix for padding the output row from the left depending */
	private get prefix(): string {
		let res = `${this.breaklines ? "\n" + Array(this.padding).join("\t") : ""}`;
		this.breaklines = true;
		return (res);
	}

	protected atCollection(node: Beat.CollectionNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += `[`;
		node._content.forEach(child => res += this.atChild(child));
		res += `${this.prefix}]`;
		res += this.atTags(metadata);
		return (res);
	}

	protected atEmpty(node: Beat.EmptyNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res+= `[]`
		res+= this.atTags(metadata);
		return (res);
	}

	protected atLeaf(node: Beat.LeafNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += node._value;
		res += this.atTags(metadata);
		return (res);
	}

	protected atAction(node: Beat.ActionNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += `@${(node._name)}: [`;
		node._inputs.forEach(child => res += this.atChild(child));
		res += `\n${Array(this.padding+1).join("\t")}=> `;
		this.breaklines = false;
		res += this.atChild(node._output);
		res += `${this.prefix}]`;
		res += this.atTags(metadata);
		return (res);
	}

	protected atInput(node: Beat.InputNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		this.breaklines = false;
		res += this.atChild(node._value);
		return (res);
	}

	protected atConstraint(node: Beat.ContstraintsNode) {
		const { _list, _matches, _optional } = node;
		let res = `{ ${_list ? "::" : "="}${(typeof _matches === "string") ? _matches : "("+_matches._path+")"}${_optional ? "?" : ""} } `;
		return (res);
	}

	protected atReference(node: Beat.ReferenceNode, metadata: Beat.Metadata) {
		let res = this.atMetadata(node._t, metadata);
		res += `(${node._path})`;
		res += this.atTags(metadata);
		return (res);
	}

	/** Utility wrapper call arount atNode for increasing the padding when moving down the tree hierarchy */
	protected atChild(node: Beat.Node) : string {
		this.padding+=1;
		let res = this.atNode(node);
		this.padding-=1;
		return (res);
	}

	/** Outputs a string for the indent level and any metadata at any given node */
	protected atMetadata(type: Beat.Type, metadata: Beat.Metadata): string {
		const { _expanded, _constraints, _assignment, _tags } = metadata;
		let res = this.prefix;

		// Assigned path
		if (_assignment) {
			res += `${type == "input" ? "-> " : ""}${(_assignment)}: `;
		}

		// Expansion symbol
		if (_expanded) {
			res += `...`;
		}

		// Add constraint info
		if (_constraints && _constraints.length) {
			_constraints.forEach(constraint => res += this.atConstraint(constraint));
		}

		return (res);
	}

	/** Outputs a string for any tags in at any given node */
	protected atTags(metadata: Beat.Metadata): string {
		const { _tags } = metadata;
		let res = "";

		// Tags
		if (_tags && _tags.length) {
			res += ` #${_tags.join(' #')}`;
		}

		return (res);
	}
}
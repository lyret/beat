import { Intepreter } from "./abstract";

/**
 * **ResolveIntepreter**
 * Interpreter that resolves actions and creates
 * a new node tree with the results
 */
export class ResolveIntepreter extends Intepreter<Beat.CollectionNode, ResolverPackage> {
	private availableActions = [];

	/** Converters the internal resolver data to a final node tree */
	outputConverstion(internalResults: ResolverPackage) : Beat.CollectionNode {
		console.log(this.availableActions);
		return internalResults.tree as Beat.CollectionNode;
	}

	protected atCollection(node: Beat.CollectionNode, metadata?: Beat.Metadata): ResolverPackage {
		node._content.forEach(child => this.atNode(child));
		return ({ tree: node });
	}

	protected atEmpty(node: Beat.EmptyNode, metadata?: Beat.Metadata): ResolverPackage {
		return ({ tree: node });
	}
	protected atLeaf(node: Beat.LeafNode, metadata?: Beat.Metadata): ResolverPackage {	
		return ({ tree: node });
	}
	protected atAction(node: Beat.ActionNode, metadata?: Beat.Metadata): ResolverPackage {
		this.availableActions.push(node);
		node._inputs.forEach(child => this.atNode(child));
		return ({ tree: node });
	}
	protected atInput(node: Beat.InputNode, metadata?: Beat.Metadata): ResolverPackage {
		this.atNode(node._value);
		return ({ tree: node });
	}
	protected atConstraint(node: Beat.ContstraintsNode, metadata?: Beat.Metadata): ResolverPackage {
		return ({ tree: node });
	}
	protected atReference(node: Beat.ReferenceNode, metadata?: Beat.Metadata): ResolverPackage {
		return ({ tree: node });
	}	
}

/** TODO: document */
interface ResolverPackage {
	tree: Beat.Node
}
/**
 * **Intepreter**
 * An intepreter is a class with methods for traversing a hierachy of
 * beat node objects and performing a specific function at each node
 * according to its design. The resolve intepreter is for resolving the logic defined
 * in beat object tree, additional intepreters exist for debbuging
 * and for re-formating text input correctly.
 */
export abstract class Intepreter<OutputData, InternalData = OutputData> {

	/**
	 * Inteprets a object node tree from a given root object in the hierachy
	 * 
	 * @param node The initial object to interpret
	 */
	public traverse(root: Beat.Node): OutputData {
		return this.outputConverstion(this.atNode(root));
	}

	/**
	 * Intersection method for identifying the type of node currently being
	 * traversed and performing the correct action
	 * 
	 * @param node The current object being traversed
	 */
	protected atNode(node: Beat.Node): InternalData {
		switch (node._t) {
			case "collection":
				return this.atCollection(node as Beat.CollectionNode, node as Beat.Metadata);
			case "empty":
				return this.atEmpty(node as Beat.EmptyNode, node as Beat.Metadata);
			case "leaf":
				return this.atLeaf(node as Beat.LeafNode, node as Beat.Metadata);
			case "action":
				return this.atAction(node as Beat.ActionNode, node as Beat.Metadata);
			case "input":
				return this.atInput(node as Beat.InputNode, node as Beat.Metadata);
			case "constraint":
				return this.atConstraint(node as Beat.ContstraintsNode, node as Beat.Metadata);
			case "reference":
				return this.atReference(node as Beat.ReferenceNode, node as Beat.Metadata);
			default:
				// Unknown node
				throw new Error("unknown node type"); // NOTE: better error handling is needed here
		}
	}

	/**
	 * The action neccessary to convert the internal data type to the output data
	 * should be overridden if InternalData and OutputData is of different types
	 */
	protected outputConverstion(internalResults: InternalData) : OutputData {
		return internalResults as any as OutputData;
	}

	/** Defines the action to perfrom at a node of the type 'collection' */
	protected abstract atCollection(node: Beat.CollectionNode, metadata?: Beat.Metadata): InternalData
	/** Defines the action to perfrom at a node of the type 'empty' */
	protected abstract atEmpty(node: Beat.EmptyNode, metadata?: Beat.Metadata): InternalData
	/** Defines the action to perfrom at a node of the type 'leaft' */
	protected abstract atLeaf(node: Beat.LeafNode, metadata?: Beat.Metadata): InternalData
	/** Defines the action to perfrom at a node of the type 'action' */
	protected abstract atAction(node: Beat.ActionNode, metadata?: Beat.Metadata): InternalData
	/** Defines the action to perfrom at a node of the type 'input' */
	protected abstract atInput(node: Beat.InputNode, metadata?: Beat.Metadata): InternalData
	/** Defines the action to perfrom at a node of the type 'constraint' */
	protected abstract atConstraint(node: Beat.ContstraintsNode, metadata?: Beat.Metadata): InternalData
	/** Defines the action to perfrom at a node of the type 'reference' */
	protected abstract atReference(node: Beat.ReferenceNode, metadata?: Beat.Metadata): InternalData
}
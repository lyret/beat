
abstract class Component {
	protected _type: Beat.Primary | Beat.Type;
	constructor(type: Beat.Primary | Beat.Type) {
		this._type = type;
	}
}

export class PrimaryComponent extends Component {
	protected _type: Beat.Primary;

	constructor(type: Beat.Primary) {
		super(type);
	}
}

export abstract class NodeComponent<NodeType extends Beat.Node> extends Component {
	protected _type: Beat.Type;
	public context: NodeComponent<Beat.Node>
	public parent: NodeComponent<Beat.Node>

	constructor(type: Beat.Type, parent?: NodeComponent<Beat.Node>) {
		super(type);
		if (parent) {
			this.parent = parent;
			this.context = parent.context;
		}
	}

	private addChildren() {

	}

	public create(type: Beat.Type, options: { path?: string }): void {
		switch (type) {
			case "collection":
				this.addChildren(new CollectionNodeComponent());
		}
	}

	public remove(options: { node?: NodeComponent<Beat.Node>, name?: string }): void {
	}
}

export class CollectionNodeComponent extends NodeComponent<Beat.CollectionNode> {
	constructor(parent?: NodeComponent<Beat.Node>) {
		super("collection", parent);
	}
}

export class EmptyNodeComponent extends NodeComponent<Beat.EmptyNode> {
	constructor(parent?: NodeComponent<Beat.Node>) {
		super("empty", parent);
	}
}
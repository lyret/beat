
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

export class NodeComponent<NodeType extends Beat.Node> extends Component {
	private _tags: Array<string>;
	private _children: Array<NodeComponent<Beat.Node>>;
	private _namedChildren: Map<String, NodeComponent<Beat.Node>>
	private _constraints: Array<Beat.ContstraintsNode>;
	private _assignment: string | undefined
	private _value: string | undefined
	private _context: NodeComponent<Beat.Node>;
	private _parent: NodeComponent<Beat.Node>;
	protected set _type(value: Beat.Type) {
		// FIXME: setter does nothing 
	}
	protected get _type(): Beat.Type {
		if (this.children.length) {
			return "collection";
		}
		if (this._value) {
			return "leaf";
		}
		return "empty";
	}

	private get _node() : Beat.Node {
		switch (this._type) {
			case "collection":
				return ({
					_t: "collection",
					_content: this.children.map(component => component.view())
				}) as Beat.CollectionNode;
			case "leaf":
				return ({
					_t: "leaf",
					_value: this._value
				}) as Beat.LeafNode;
			case "empty":
				return ({
					_t: "empty"
				}) as Beat.EmptyNode;
			default:
				throw new Error("Unable to to transform the component to the corresponding node"); // TODO: Error handling
		}
	}

	private get _metadata() : Beat.Metadata {
		return ({
			_constraints: this._constraints,
			_assignment: this._assignment,
			_tags: this._tags
		});
	}

	constructor(definition: Beat.UnknownNodeWithMetadata, parent?: NodeComponent<Beat.Node>) {
		super(definition._t);
		this._children = [];
		this._namedChildren = new Map();
		this._constraints = definition._constraints || [];
		this._assignment = definition._assignment || undefined;
		this._tags = definition._tags || [];

		if (parent) {
			this._parent = parent;
			this._context = parent._context;
		}

		// if (definition._t == "action") {
		// 	definition.
		// }

		if (definition._t == "leaf") {
			this._value = definition._value;
		}

		if (definition._t == "collection") {
			for (const member of definition._content) {
				this.addChildren(new NodeComponent(member as Beat.UnknownNode));
			}
		}
	}

	public get assignment() {
		return this._assignment;
	}

	public get children() {
		return [...this._namedChildren.values(), ...this._children];
	}

	private addChildren(component: NodeComponent<Beat.Node>) {
		if (component.assignment) {
			this._namedChildren.set(component.assignment, component);
		} else {
			this._children.push(component);
		}
	}

	public create(definition: Beat.UnknownNodeWithMetadata): NodeComponent<Beat.Node> {
		const component = new NodeComponent(definition, this);
		this.addChildren(component);

		return (component);
	}

	public remove(options: { node?: NodeComponent<Beat.Node>, name?: string }): void {
	}

	public view(): Beat.NodeWithMetadata {
		return ({
			...this._node,
			...this._metadata
		});
	}
}
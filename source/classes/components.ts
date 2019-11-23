
abstract class AbstractComponent {
	protected _type: Beat.Primary | Beat.Type;
}

class PrimaryComponent extends AbstractComponent {
	protected _type: Beat.Primary;

	constructor(type: Beat.Primary) {
		super();
		this._type = type;
	}
}

abstract class AbstractNodeComponent<NodeType extends Beat.Node> extends AbstractComponent {
	protected _type: Beat.Type;

	constructor(type : Beat.Type) {
		super();
		this._type = type;
	}

	public ToNode() : Beat.Node {
		return ({
			_t: this._type
		});
	};
}

class EmptyNodeComponent extends AbstractNodeComponent<Beat.EmptyNode> {
	constructor() {
		super("empty")
	}
}

console.log("Test");
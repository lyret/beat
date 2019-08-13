import { find } from 'lodash';

const document: Node = {
	value: "root",
	children: [
		{
			value: "person",
			children: [
				{ value: "name", rules: { matches: "string", tags: [{ name: "firstname", rules: { matches: "string", optional: true } }, { name: "lastname", rules: { matches: "string", optional: true } }] } },
				{ value: "phone", rules: { matches: "number", optional: true } }
			]
		},
		{
			value: "contacts",
			rules: {
				matches: "ref",
				ref: "person",
				list: true,
			},
			children: [
		/* Andreas */ {
					children: [
						{ value: "name", children: [{ value: "Andreas" }, { value: "Malmqvist" }] }
					]
				},
		/* Viktor */ {
					children: [
						{ value: "name", children: [{ value: "Viktor", tags: ["firstname"] }, { value: "Lyresten", tags: ["lastname"] }] },
						{ value: "phone", children: [{ value: "0703749226" }] }
					]
				},
		/** Picard */ {
					children: [
						{
							value: "name", children: [
								{ children: [{ value: "Jean" }, { value: "Luc" }], tags: ["firstname"] },
								{ value: "Picard", tags: ["lastname"] }
							]
						}
					]
				}
			]
		}
	]
}

interface Node {
	value?: string
	tags?: Array<string>
	children?: Array<Node>;

	// Template fields
	rules?: {
		optional?: boolean,
		matches?: "string" | "number" | "ref"
		ref?: string,
		list?: boolean,
		tags?: Array<{ name: string, rules: Node['rules'] }>
	}
}

function interpret(node: Node, inset = 1, root?: Node): void {
	const { value, children, rules, tags } = node;
	const prefix = Array(inset).join("\t");
	if (value) {
		console.log(`${prefix}${value.toUpperCase()}${tags ? " #"+tags.join(' #') : ""}`);
	}
	if (rules) {
		const { matches, optional, ref, list } = rules;
		if (ref) {
			// Find the reference, only absolute paths are supported
			const refNode = find(root.children, (node => node.value == ref));
			console.log("REFNODE", refNode);
		}
		console.log(
			`${prefix}${list? "list of" : "matching"} ${matches == "ref" ? ref : matches} ${optional ? "(optional)" : ""}`
		);
		if (rules.tags) {
			rules.tags.forEach(tag => {
				console.log(prefix + "  #"+tag.name);
				if (rules) {
					const { matches, optional, ref, list } = tag.rules;

					console.log(
						`${prefix}  ${list? "list of" : "matching"} ${matches == "ref" ? ref : matches} ${optional ? "(optional)" : ""}`
					);
				}
			});
		}
	}

	if (children) {
		children.forEach(child => interpret(child, inset+1, root || node));
	}
}

interpret(document);



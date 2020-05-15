const { AutoComplete } = require('enquirer');
const termSize = require('term-size');



let Prompt: any | null = null;
let Output = "";
const Commands = [
	"add",
	"delete",
	"view",
	"quit"
]

function write(reRenderPrompt: boolean = true) {

	// Clear the console
	console.clear();

	// Get the number of total rows and colums in the terminal
	const { rows, columns } = termSize();

	// Get the number of usedRows by the current output and divider
	const outputRows = Output.split(/\r\n|\r|\n/).length + 1;

	// Write the output to the terminal
	console.log(Output);

	// Write empty spaces
	for (let i = 0; i < rows - outputRows - 9; i++) {
		console.log();
	}

	// Write the divider
	let divider = "";
	for (let i = 0; i < columns; i++) {
		divider += "\u2581"
	}
	console.log(divider);
	console.log("BEAT (programmer)" + "\n");

	// Render the current prompt
	if (Prompt && reRenderPrompt) {
		Prompt.render();
	}
}

async function main() {
	let iteration = 0;
	write();

	while (true) {
		// Increase the iteration count
		iteration++;

		// Get the next command from the user
		Prompt = new AutoComplete({
			name: 'command' + iteration,
			message: 'Enter command:',
			//limit: 2,
			choices: Commands
		});

		const answser: string = await Prompt.run();

		// Command specific output
		switch (answser) {
			case "add":
				Output = "this is the add command...";
				break;
			case "delete":
				Output = "this is the delete command...";
				break;
			case "view":
				Output = "this is the view command...";
				break;
			case "quit":
				Output = "good bye!";
				process.exit(0);
				break;
			default:
				Output = "unknown command"
				break;
		}

		// Write the output
		write(false);
	}
}

process.stdout.on('resize', () => write());
main();
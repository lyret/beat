import { readFileSync, writeFileSync, existsSync } from 'fs'
import { template } from 'lodash'

type path = string;
type manifest = { beat: number }

function saveBeat(targetPath: path, manifest: manifest) {
	const beatPath: path = targetPath + '.beat' + manifest.beat;
	const targetContent: string = readFileSync(targetPath, { encoding: 'UTF-8' });

	writeFileSync(beatPath, targetContent);

	manifest.beat += 1;
	updateManifest(targetPath, manifest);

	return targetContent;
}

function loadManifest(targetPath: path): manifest {
	const defaultManifestContents: manifest = { beat: 0 }
	const manifestPath: path = targetPath + '.manifest.json'

	if (!existsSync(manifestPath)) {
		updateManifest(targetPath, defaultManifestContents);
		return defaultManifestContents;
	}

	const data = readFileSync(manifestPath, { encoding: 'UTF-8' });
	return JSON.parse(data);
}

function updateManifest(targetPath: path, manifest: manifest): void {
	const manifestPath = targetPath + '.manifest.json'

	writeFileSync(manifestPath, JSON.stringify(manifest, null, 4), { encoding: 'UTF-8' });
	return;
}

function main() {
	try {
		const targetPath = 'main.ts';
		const manifest = loadManifest(targetPath);

		saveBeat(targetPath, manifest);
	}
	catch (error) {
		console.error(error);
	}
}


// On file execution
if (!module.parent) {
	//main();
	console.log(template('lol<%=variable&>'))
}
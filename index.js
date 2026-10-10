import fs from "node:fs";
function fileApi(fullPath) {
	const content = fs.readFileSync(fullPath, "utf8");
	const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

	if (lines.length === 0) {
		return { len: 0, routes: new Map() };
	}

	const len = parseInt(lines[0].trim(), 10);
	const routes = new Map();

	for (let i = 1; i <= len && i < lines.length; i++) {
		const parts = lines[i].trim().split(/\s+/);
		if (parts.length >= 2) {
			const edge = parts[0];
			const weight = parseInt(parts[1], 10);
			routes.set(edge, weight);
		}
	}
	return { len, routes };
}
function findShortestPaths(routes) {
	const vertices = new Set();
	const dist = {};

	for (const [edge, weight] of routes) {
		const from = edge[0];
		const to = edge[1];
		vertices.add(from);
		vertices.add(to);

		if (!dist[from]) dist[from] = {};
		if (dist[from][to] === undefined || weight < dist[from][to]) {
			dist[from][to] = weight;
		}
	}

	const vList = Array.from(vertices);

	for (const v of vList) {
		if (!dist[v]) dist[v] = {};
		dist[v][v] = 0;
	}

	for (const k of vList) {
		for (const i of vList) {
			if (dist[i]?.[k] === undefined) continue;
			for (const j of vList) {
				if (dist[k]?.[j] === undefined) continue;
				const newDist = dist[i][k] + dist[k][j];
				if (dist[i]?.[j] === undefined || newDist < dist[i][j]) {
					dist[i][j] = newDist;
				}
			}
		}
	}

	// Collect pairs (u != v) that have a valid path
	const results = [];
	for (const u of vList) {
		for (const v of vList) {
			if (u !== v && dist[u]?.[v] !== undefined) {
				results.push({
					edge: `${u}${v}`,
					weight: dist[u][v],
				});
			}
		}
	}

	results.sort((a, b) => a.edge.localeCompare(b.edge));

	const sortedMap = new Map();
	for (const { edge, weight } of results) {
		sortedMap.set(edge, weight);
	}

	return sortedMap;
}

function main() {
	const files = fs
		.readdirSync("./Input/")
		.filter((file) => file.endsWith(".txt"));
	for (const file of files) {
		const { routes } = fileApi(`./Input/${file}`);
		const result = findShortestPaths(routes);
		result.forEach((weight, edge) => {
			fs.appendFileSync(`./Output/${file}`, `${edge} ${weight}\n`, "utf-8");
		});
	}
}

main();

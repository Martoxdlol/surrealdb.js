import replace from "@rollup/plugin-replace";
import { defineConfig } from "rollup";
import typescript from "rollup-plugin-ts";

const convertTsToJs = replace({
	// by default, files are configured to work for deno, which uses exact .ts imports
	// node, however, does not like .ts extensions and tsc will complain if we don't use .js
	preventAssignment: true,
	values: { ".ts": ".js" },
});

const withIsomorphicWs = replace({
	// injects isomorphic-ws during build time for node/browser build
	preventAssignment: true,
	values: {
		"// %isomorphic-ws%": 'import WebSocket from "isomorphic-ws"',
	},
	delimiters: ["", ""],
});

const usingTsWithEsModules = typescript({
	hook: {
		outputPath: (path, kind) =>
			// replace .mts with .ts since declarations files emit without
			// extensions and can't resolve .mts
			kind === "declaration" ? path.replace(/\.mts$/, ".ts") : path,
	},
});

const usingTsWithCommonJS = typescript();

export default defineConfig([
	{
		input: "./src/index.ts",
		plugins: [
			convertTsToJs,
			withIsomorphicWs,
			usingTsWithEsModules,
		],
		external: [
			"isomorphic-ws",
		],
		output: [
			{
				dir: "dist/esm",
				preserveModules: true,
				preserveModulesRoot: "src",
				entryFileNames: "[name].mjs",
			},
		],
	},
	{
		input: "./src/index.ts",
		plugins: [
			convertTsToJs,
			withIsomorphicWs,
			usingTsWithCommonJS,
		],
		external: [
			"isomorphic-ws",
		],
		output: {
			dir: "dist/cjs",
			format: "cjs",
			exports: "named",
			interop: "auto",
			preserveModules: true,
			preserveModulesRoot: "src",
		},
	},
	{
		input: "./src/index.ts",
		plugins: [
			convertTsToJs,
			usingTsWithEsModules,
		],
		output: {
			dir: "./dist/web",
			format: "esm",
		},
	},
]);

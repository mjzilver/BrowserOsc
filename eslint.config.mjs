import globals from "globals";
import pluginJs from "@eslint/js";

export default [
	{
		files: ["**/*.{js,mjs,cjs,ts}"],
		rules: {
			indent: ["error", "tab"],
		},
	},
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
];

import { codeBlock } from "@blocknote/code-block";

export const codeBlockOptions = {
	...codeBlock,
	indentLineWithTab: true,
	defaultLanguage: "typescript",
	supportedLanguages: {
		text: {
			name: "Plain Text",
			aliases: ["txt"],
		},
		typescript: {
			name: "TypeScript",
			aliases: ["ts"],
		},
		javascript: {
			name: "JavaScript",
			aliases: ["js"],
		},
		json: {
			name: "JSON",
			aliases: ["json"],
		},
		html: {
			name: "HTML",
			aliases: ["html"],
		},
		css: {
			name: "CSS",
			aliases: ["css"],
		},
	},
};

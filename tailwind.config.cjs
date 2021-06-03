

module.exports = {
	mode: "jit",
	purge: [
		"./src/**/*.{html,js,svelte,ts}",
	],
	theme: {
		colors: {
			transparent: 'transparent',
			black: '#000',
			white: '#fff',
			grey: '#F3F4F6',
			background: '#EEF2FF'
		},
		extend: {
			outline: {
			  blue: '2px solid #8B5CF6',
			}
		}
	},
	plugins: [],
};

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
		[
			'module-resolver',
			{
				root: ['./src'],
				alias: {
					'@src': './src',
					'@container': './src/container',
				},
				extensions: ['.tsx', '.ts', '.js', '.json']
			}
		]
	],
};

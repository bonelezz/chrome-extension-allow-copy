import replace from 'rollup-plugin-replace'

export default {
  entry: 'src/js/index.js',
  format: 'iife',
  moduleName: 'allowcopy',
  dest: 'dist/allowcopy.js',
  plugins: [replace({ __DEV__: !!process.env.DEV })]
}

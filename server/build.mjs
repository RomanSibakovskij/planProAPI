import * as esbuild from 'esbuild';

// Bundle the server code using esbuild. We will use this code to bundle the server code for production.
try {
  // Bundle the server code using esbuild with the following options:
  await esbuild.build({
    // Entry point for the server code.
    entryPoints: ['./server.mjs'],
    // Bundle the code for Node.js environment.
    bundle: true,
    // Do not generate source maps for the production build. What is a source map? A source map is a file that maps the minified code back to the original code. This is useful for debugging the minified code.
    sourcemap: false,
    // Minify the code for production. What is minify? Minify is the process of removing unnecessary characters from the source code. This includes removing whitespace, comments, and other characters that are not required for the code to run.
    minify: true,
    // Specify the target platform as Node.js and the target version as Node.js 16.
    platform: 'node',
    target: 'node16',
    // Specify the external packages that should not be bundled. We will exclude the external packages from the bundle. What is an external package? An external package is a package that is not part of the project and should not be bundled with the project code. This includes packages like express, pg, and dotenv.
    packages: 'external',
    // Output the bundled server code to the dist/server.js file.
    outfile: './dist/server.js',
  });

  console.log('Server bundled successfully for production!');
} catch (error) {
  console.error('An error occurred during bundling:', error);
  process.exit(1);
}
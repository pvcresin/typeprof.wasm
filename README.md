# typeprof.wasm

## How to build a custom ruby.wasm

```
$ cd wasm-build
$ ./build.sh
$ cp ruby.wasm ../public
```

## How to build vscode-rbs-syntax

```
$ git clone https://github.com/soutaro/vscode-rbs-syntax.git
$ cd vscode-rbs-syntax
$ npm install
$ npm run package
$ cp rbs-syntax-*.vsix ../public/
```

## How to preview

The preview mode loads typeprof from public/typeprof directory.

```
$ npm install
$ git clone https://github.com/ruby/typeprof.git public/typeprof
$ npm run dev
```

## How to build

```
$ npm run build
```

## How to run E2E tests

The end-to-end tests build the production bundle, serve it locally, and drive a
real browser to verify that ruby.wasm boots and TypeProf reports type errors.

```
$ npm install
$ npx playwright install chromium
$ npm run test:e2e
```

The tests use the committed `public/ruby.wasm`, so no preview/dev setup is
required. They also run on CI via `.github/workflows/e2e.yml`.

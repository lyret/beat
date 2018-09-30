<p align="center"><img src="./files/beat_logo.png" /></p>

# The Beat language
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
![license](https://img.shields.io/github/license/lyret/beat.svg)
![last-commit](https://img.shields.io/github/last-commit/lyret/beat.svg)

This is very much a work in progress. Thank you for stopping by. ♥ ♥ ♥

Beat can best be seen as a similtainusly exploration and implementation of several idéas that been slowing growing in my mind the last couple of years, therefor I'm unwilling to commit to any specifics, and I'm updating this readme as I go along, but Im currently very interested in the following 2 topics:

* How infrastructure as code relate to the idéa of separation between code and data.

* The agreements and s.o.c. between applications and runtime environments and between developer and operating systems today.


## Current syntax

See the state of the syntax at this given commit at [files/current_syntax.html](`beat/files/current_syntax.html)


## Requirements

This repository contains several project using [Lerna](https://lernajs.io/). Run `npm install` inside the workspace root to install the dependencies for all packages.

Tested with:
```
node v10.11.0
typescript v3.1.1
lerna v3.4.0
```
Use `nvm use` to quickly check out the correct version of Node and NPM.


## Running

### Launching the language service in vs code

Open the workspace included in the repo. Start a debug session using the `Launch Extension` task.

A seperate instance of vs code will launch with the language service extension "installed". Currently heavy in development

### Testing only the parser

Edit the file **test-parer.txt** inside the directory *language_parser* and executer
```
npm run compile; node .output/test-parser.js
```
Or open the vs code output and start the debug mode called **Test the parser**.

At the moment some debug output will be generated from each run.
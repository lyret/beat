<p align="center"><img src="./documentation/files/beat_logo.png" /></p>

# The Beat language
![GitHub package.json version](https://img.shields.io/github/package-json/v/lyret/beat)
![license](https://img.shields.io/github/license/lyret/beat.svg)
![last-commit](https://img.shields.io/github/last-commit/lyret/beat.svg)
![mantained-status](https://img.shields.io/maintenance/yes/2019)
![node-version](https://img.shields.io/badge/node%20-v10.11.0-brightgreen)
![typescript-version](https://img.shields.io/badge/typescript-3.1.1-blue)

## Repository contents:

#### Source:
The source implementation of the Beat programming language, written in Typescript. See the documentation for further details.

 - **Tests**: Contains scripts for testing the source code.

#### **Code client**:
A VS code extension that provides language services for Beat.

 - **Syntax**:
Contains a TextMate syntax definitions file for themable highligths in VS Code and other editors
supporting the format.

 - **Workspace:**
 Contains testfiles in Beat syntax for testing the IDE with the Beat extension or language server installed.

#### Language server:
An Language service protocol implementation for Beat.




This is very much a work in progress. Thank you for stopping by. ♥ ♥ ♥

Beat can best be seen as an exploration and implementation of several idéas that been slowly rotating in my mind the last couple of years, therefor I'm unwilling to commit to any specifics, and I'm updating this readme as I go along, but Im currently very interested in the following 2 topics:

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

### Getting started

Launch the workspace in VS Code and run the task named `initialize workspace`. You are now ready to develop!

Alternative, execute the `npm install` command in the root folder

### Launching the language service in vs code

Open the workspace in VS Code start debug session by selecting the option `Launch Extension` from the debug menu.

A new instance of Code will launch in a new window with the language service extension installed.

### Testing only the parser

Edit the file **test-parer.txt** inside the directory *language_parser* and executer
```
npm run compile; node .output/test-parser.js
```
Or open the vs code output and start the debug mode called **Test the parser**.

At the moment some debug output will be generated from each run.

## A big *Thank you* to the authors of the following articles:
https://macromates.com/manual/en/language_grammars
https://www.apeth.com/nonblog/stories/textmatebundle.html
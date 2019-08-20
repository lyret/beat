<p align="center"><img src="./documentation/files/beat_logo.png" /></p>

**This is very much a work in progress. Thank you for stopping by. ♥ ♥ ♥**

---
![GitHub package.json version](https://img.shields.io/github/package-json/v/lyret/beat)
![license](https://img.shields.io/github/license/lyret/beat.svg)
![last-commit](https://img.shields.io/github/last-commit/lyret/beat.svg)
![mantained-status](https://img.shields.io/maintenance/yes/2019)


# The Beat Language

Beat can best be seen as an exploration and implementation of several different idéas that been slowly rotating in my mind the last couple of years, mainly regarding

* How infrastructure as code relate to the idéa of separation between code and data.

* Limitations and constraints of text based programming.

* The agreements and s.o.c. between applications and runtime environments and between developer and operating systems today.

The language definition and implementation is highly in flux, and this repository will be updated sporadicly as inspiration and motivation strikes. 

## Current syntax

The current state of the syntax can be viewed [here](`beat/documentation/files/current_syntax.html).

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


### ♥ Thanks to the authors of the following articles:
https://macromates.com/manual/en/language_grammars
https://www.apeth.com/nonblog/stories/textmatebundle.html


## Installing, running and developing

The _in-progress_ first [implementation](beat/source) of Beat is being developed in Typescript for Node.JS, you can test it and help out by cloning this repository and getting it running on any machine meeting the following specifications:

![os-version](https://img.shields.io/badge/os%20-mac|windows|linux-lightgray)
![node-version](https://img.shields.io/badge/node%20-v10.11.0-brightgreen)
![typescript-version](https://img.shields.io/badge/typescript-3.1.1-blue)

No globaly installed packages are needed, but depending on your use case I recomend installing the following cmd tools:
 - **nvm:** For switching to the correct node version, needed for running the npm scripts.
 - **ts-node:** Is necessary for running the source code tests.

**Visual studio code** is recommended to test and work on the Language server implementation and Editor extension.

Basic knowledge for using node.js and npm is required for getting started.
# github-javascript-actions

A repository for experimenting with and creating JavaScript GitHub actions.

# Hello world javascript action

This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

## Inputs

## `who-to-greet`

**Required** The name of the person to greet. Default `"World"`.

## Outputs

## `time`

The time we greeted you.

## Example usage

uses: ./
with:
  who-to-greet: 'Your Name'

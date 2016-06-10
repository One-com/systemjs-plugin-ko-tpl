# Knockout template loader plugin for SystemJS

[![NPM version](https://badge.fury.io/js/systemjs-plugin-ko-tpl.svg)](http://badge.fury.io/js/systemjs-plugin-ko-tpl)

Will load templates into the document as script tags with id's corresponding to the
name of the file.

## Installing

For SystemJS use, locate the plugin file in the application, and then locate it with map configuration:

```javascript
System.config({
  map: {
    tpl: 'path/to/knockout-tpl.js'
  }
});
```

For installing with jspm, run `jspm install text`.

## Basic Use

```javascript
import './template.ko!tpl';
```

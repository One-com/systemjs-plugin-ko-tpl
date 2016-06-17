var AssetGraph = require('assetgraph');
var path = require('path');

var rootPath = path.resolve(__dirname, 'http-pub');
var outRootPath = path.resolve(__dirname, 'http-pub-production');

new AssetGraph({ root: rootPath })
  .logEvents()
  .registerRequireJsConfig({ preventPopulationOfJavaScriptAssetsUntilConfigHasBeenFound: true })
  .loadAssets('index.html')
  .populate()
  .bundleSystemJs()
  .assumeRequireJsConfigHasBeenFound()
  .inlineKnockoutJsTemplates()
  .removeOrPolyfillSystemJs()
  .removeRelations()
  .bundleRelations()
  .writeAssetsToDisc({url: /^file:/, isLoaded: true}, outRootPath, false)
  .writeStatsToStderr()
  .run();

var AssetGraph = require('assetgraph');
var expect = require('unexpected')
    .clone()
    .use(require('assetgraph/test/unexpectedAssetGraph.js'));

describe('assetgraph', function () {
    it('should be able to register a template', function () {
        return new AssetGraph({root: __dirname + '/../fixtures/assetgraph/simple/'})
            .registerRequireJsConfig({ preventPopulationOfJavaScriptAssetsUntilConfigHasBeenFound: true })
            .loadAssets('index.html')
            .populate()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain assets', 'JavaScript', 3);
                expect(assetGraph, 'to contain relations', { type: 'HtmlScript', from: { url: /index\.html$/} }, 3);
                expect(assetGraph.systemJsConfig, 'to satisfy', {
                    configStatements: expect.it('to have length', 1),
                    topLevelSystemImportCalls: expect.it('to have length', 1)
                });
            })
            .bundleSystemJs()
            .assumeRequireJsConfigHasBeenFound() // And System.js
            .populate()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain assets', { type: 'Html', isFragment: true }, 1);

            })
            .inlineKnockoutJsTemplates()
            .bundleRelations()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain assets', 'JavaScript', 1);
                expect(assetGraph, 'to contain assets', { type: 'Html', isInline: true }, 1);

                var relation = assetGraph.findRelations({type: 'HtmlInlineScriptTemplate', node: function (node) { return node.getAttribute('id') === 'template'; }})[0];
                expect(relation, 'to be ok');
                expect(relation.to.text, 'to equal', '<div>TEST_TEMPLATE</div>\n');
            });
    });
});

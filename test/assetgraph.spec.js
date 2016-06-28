var AssetGraph = require('assetgraph');
var expect = require('unexpected')
    .clone()
    .use(require('assetgraph/test/unexpectedAssetGraph.js'));

describe('assetgraph', function () {
    it('should be able to register a template', function () {
        return new AssetGraph({root: __dirname + '/../fixtures/simple/'})
            .registerRequireJsConfig({ preventPopulationOfJavaScriptAssetsUntilConfigHasBeenFound: true })
            .loadAssets('index.html')
            .populate()
            .bundleSystemJs()
            .assumeRequireJsConfigHasBeenFound()
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
    it('should be able to register nested templates', function () {
        return new AssetGraph({root: __dirname + '/../fixtures/nested/'})
            .registerRequireJsConfig({ preventPopulationOfJavaScriptAssetsUntilConfigHasBeenFound: true })
            .loadAssets('index.html')
            .populate()
            .bundleSystemJs()
            .assumeRequireJsConfigHasBeenFound()
            .populate()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain assets', { type: 'Html', isFragment: true }, 3);

            })
            .inlineKnockoutJsTemplates()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain assets', { type: 'Html', isInline: true }, 3);

                var relations = assetGraph.findRelations({type: 'HtmlInlineScriptTemplate' });
                expect(relations, 'to satisfy', [
                    { node: { id: 'template' } },
                    {
                        to: { text: expect.it('to contain', '<h1>NESTED TEMPLATE ONE</h1>') },
                        node: { id: 'nestedTemplateOne' }
                    },
                    {
                        to: { text: expect.it('to contain', '<h1>NESTED TEMPLATE TWO</h1>') },
                        node: { id: 'nestedTemplateTwo' }
                    }
                ]);
            });
    });
});

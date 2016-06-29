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
    it('should remove the template from the bundle', function () {
        return new AssetGraph({root: __dirname + '/../fixtures/simple/'})
            .registerRequireJsConfig({ preventPopulationOfJavaScriptAssetsUntilConfigHasBeenFound: true })
            .loadAssets('index.html')
            .populate()
            .bundleSystemJs()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain assets', { type: 'Html', isFragment: true }, 1);
                expect(assetGraph.findRelations({
                    from: { url: /index\.html$/ },
                    to: { fileName: /bundle/ }
                })[0].to.text, 'not to contain', '<div>TEST_TEMPLATE</div>');

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
                // the to value points at a non existant file name template.ko/nestedTemplateOne.ko
                expect(relations, 'to satisfy', [
                    {
                        to: { text: '\n\n' },
                        node: { id: 'template' }
                    },
                    {
                        to: { text: '\n    <h1>NESTED TEMPLATE ONE</h1>\n' },
                        node: { id: 'nestedTemplateOne' }
                    },
                    {
                        to: { text: '\n    <h1>NESTED TEMPLATE TWO</h1>\n' },
                        node: { id: 'nestedTemplateTwo' }
                    }
                ]);
            });
    });
});

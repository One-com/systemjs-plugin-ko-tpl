var Builder = require('systemjs-builder');
var expect = require('unexpected');
var path = require('path');

describe('systemjs-builder', function () {
    it('should pick up on a template', function () {
        var testCasePath = path.resolve(__dirname, '../fixtures/simple');
        var configPath = path.resolve(testCasePath, 'config.js');
        var builder = new Builder();
        builder.config({ baseURL: testCasePath });
        builder.loadConfigSync(configPath);
        return expect(builder.bundle('main.js'), 'to be fulfilled').then(function (bundle) {
            return expect(bundle, 'to satisfy', {
                modules: [
                    'main.js',
                    'template.ko!tpl.js'
                ],
                tree: {
                    'template.ko!tpl.js': {
                        metadata: {
                            templateContent: '<div>TEST_TEMPLATE</div>\n'
                        }
                    }
                },
                assetList: [
                    {
                        url: expect.it('to match', /template.ko/),
                        type: 'knockout-template'
                    }
                ]
            });
        });
    });
    it('should register a nested template', function () {
        // It will pick up a nested module as a single module, and thus it is
        // up to assetgraph and the inlined injectTemplates method to split the
        // templates into separate html tags. Unless the fetch hook can fan out
        // into multiple loaded modules, I cannot see how we can fix this.
        var testCasePath = path.resolve(__dirname, '../fixtures/nested');
        var configPath = path.resolve(testCasePath, 'config.js');
        var builder = new Builder();
        builder.config({ baseURL: testCasePath });
        builder.loadConfigSync(configPath);
        return expect(builder.bundle('main.js'), 'to be fulfilled').then(function (bundle) {
            return expect(bundle, 'to satisfy', {
                modules: [
                    'main.js',
                    'template.ko!tpl.js'
                ],
                tree: {
                    'template.ko!tpl.js': {
                        metadata: {
                            templateContent: [
                                '<script type="text/html" id="nestedTemplateOne">',
                                '    <h1>NESTED TEMPLATE ONE</h1>',
                                '</script>',
                                '<script type="text/html" id="nestedTemplateTwo">',
                                '    <h1>NESTED TEMPLATE TWO</h1>',
                                '</script>'
                            ].join('\n') + '\n'
                        }
                    }
                },
                assetList: [
                    {
                        url: expect.it('to match', /template.ko/),
                        type: 'knockout-template'
                    }
                ]
            });
        });
    });
});

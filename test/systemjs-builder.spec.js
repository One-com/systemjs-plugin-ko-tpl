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
});

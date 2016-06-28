/* global Promise */
var plugin = require('../');
var expect = require('unexpected');

function loadFactory(address, templateContent) {
    address = address || 'fakeTemplate.ko';
    var load = {
        address: 'file://' + __dirname + '/fake/' + address,
        metadata: {}
    };

    if (templateContent) {
        load.metadata.templateContent = templateContent;
    }

    return load;
}

describe('systemjs-plugin-ko-tpl', function () {
    describe('fetch', function () {
        it('should be a function', function () {
            return expect(plugin.fetch, 'to be a function');
        });
        it('should set the template on metadata when called from builder', function () {
            var fakeTemplate = 'fakeTemplate';
            var fakeContext = { builder: true };
            var load = loadFactory();
            var fetch = function () { return Promise.resolve(fakeTemplate); };
            var promise = plugin.fetch.call(fakeContext, load, fetch);
            return expect(promise, 'to be fulfilled').then(function () {
                return expect(load, 'to satisfy', {
                    metadata: {
                        templateContent: fakeTemplate
                    }
                });
            });
        });
    });
    describe('bundle', function () {
        it('should be a function', function () {
            return expect(plugin.bundle, 'to be a function');
        });
        it('should return a iife that injects would inject templates', function () {
            var result = plugin.bundle([
                loadFactory('fooTemplate.ko', '<div>foo</div>'),
                loadFactory('barTemplate.ko', '<div>bar</div>')
            ]);
            return expect(result, 'to satisfy', {
                source: expect.it('to contain', '<div>foo</div>')
                            .and('to contain', '<div>bar</div>')
                            .and('to match', /^\(function injectTemplates[^]+\)\([^]+\);$/m)
            });
        });
    });
    describe('listAssets', function () {
        it('should be a function', function () {
            return expect(plugin.listAssets, 'to be a function');
        });
        it('should return a list of one asset', function () {
            return expect(plugin.listAssets([
                loadFactory('fooTemplate.ko', '<div>foo</div>')
            ]), 'to satisfy', [
                {
                    url: expect.it('to match', /fooTemplate.ko$/),
                    source: '<div>foo</div>',
                    type: 'knockout-template'
                }
            ]);
        });
        it('should return a list of assets', function () {
            return expect(plugin.listAssets([
                loadFactory('fooTemplate.ko', '<div>foo</div>'),
                loadFactory('barTemplate.ko', '<div>bar</div>'),
                loadFactory('bazTemplate.ko', '<div>baz</div>'),
                loadFactory('quxTemplate.ko', '<div>qux</div>')
            ]), 'to satisfy', [
                { type: 'knockout-template' },
                { type: 'knockout-template' },
                { type: 'knockout-template' },
                { type: 'knockout-template' }
            ]);
        });
    });
});

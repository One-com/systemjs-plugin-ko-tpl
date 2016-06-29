var translate = typeof window !== 'undefined' && window.TRHTML;

function getBaseNameFromUrl(url) {
    return url.split('/').pop().replace(/^(.*)\.ko\?/, '').replace(/\.ko$/, '');
}

var splitTemplate = function (load) {
    var loads = [];
    var source = load.metadata.templateContent;
    var newSource = source.replace(/<script[^>]*>([^]*?)<\/script>/gm, function (tag, content) {
        var id = tag.match(/<script [^>]*id=["']([a-zA-Z0-9-_]+)["'][^>]*>/);
        if (id) {
            id = id[1];
        } else {
            throw new Error('invalid subtemplate in ' + loads.address);
        }
        loads.push({
            address: load.address + '?' + id,
            metadata: {
                templateContent: content
            }
        });
        return '';
    });

    return [{
        address: load.address,
        metadata: {
            templateContent: newSource
        }
    }].concat(loads);
};

var flatMap = function (list, fn) {
    return Array.prototype.concat.apply([], list.map(fn));
};

var injectTemplates = function injectTemplates(templates) {
    templates.forEach(function (tpl) {
        var s = document.createElement('script');
        s.id = tpl.id;
        s.innerHTML = tpl.content;
        s.type = 'text/html';
        document.head.appendChild(s);
    });
};

module.exports = {
    fetch: function (load, fetch) {
        var builder = this.builder;
        return fetch(load).then(function (source) {
            load.metadata = load.metadata || {};
            load.metadata.templateContent = source;
            if (!builder) {
                var nestedTemplates = splitTemplate(load);
                injectTemplates(nestedTemplates.map(function (load) {
                    var source = load.metadata.templateContent;
                    return {
                        id: getBaseNameFromUrl(load.address),
                        content: translate ? translate(source) : source
                    };
                }));
            }
            return '';
        });
    },
    bundle: function (loads) {
        var templates = flatMap(loads, splitTemplate).map(function (load) {
            return {
                id: getBaseNameFromUrl(load.address),
                content: load.metadata.templateContent
            };
        });
        var json = JSON.stringify(templates, null, 2);
        return {
            source: '(' + injectTemplates.toString() + ')(' + json + ');'
        };
    },
    listAssets: function (loads) {
        return flatMap(loads, splitTemplate).map(function (load) {
            return {
                url: load.address.replace('?', '/').replace(/(\.ko|)$/, '.ko'),
                source: load.metadata.templateContent,
                type: 'knockout-template'
            };
        });
    }
};

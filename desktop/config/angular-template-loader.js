/**
 * Replacement for [angular2-template-loader](https://npmjs.org/package/angular2-template-loader) without `loader-utils`.
 */

const templateUrlRegex = /templateUrl\s*:(\s*['"`](.*?)['"`]\s*([,}]))/gm;
const stylesRegex = /styleUrls *:(\s*\[[^\]]*?\])/g;
const stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g;

function replaceStringsWithRequires(string) {
    return string.replace(stringRegex, function (match, quote, url) {
        if (url.charAt(0) !== ".") {
            url = "./" + url;
        }
        return "require('" + url + "')";
    });
}

module.exports = function (source, sourcemap) {
    this.cacheable && this.cacheable();

    const newSource = source
        .replace(templateUrlRegex, function (match, url) {
            // replace: templateUrl: './path/to/template.html'
            // with: template: require('./path/to/template.html')
            return "template:" + replaceStringsWithRequires(url);
        })
        .replace(stylesRegex, function (match, urls) {
            // replace: stylesUrl: ['./foo.css', "./baz.css", "./index.component.css"]
            // with: styles: [require('./foo.css'), require("./baz.css"), require("./index.component.css")]
            return "styles:" + replaceStringsWithRequires(urls);
        });

    if (this.callback) {
        this.callback(null, newSource, sourcemap);
    } else {
        return newSource;
    }
};

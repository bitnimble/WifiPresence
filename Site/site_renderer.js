var ejs = require("ejs");

exports.renderPage = function renderPage(html, page_options) {
    page_options = (typeof page_options != "undefined") ? page_options : {};
    var compiled = ejs.compile(html);
    var html = compiled({ page_options : page_options });
    return html;
}

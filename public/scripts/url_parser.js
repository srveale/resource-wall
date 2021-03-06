const getLocation = function (href) {
    console.log('href', href);

    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    console.log('match', match);
    return match && {
        protocol: match[1] || '',
        host: match[2] || '',
        hostname: match[3] || '',
        port: match[4] || '',
        pathname: match[5] || '',
        search: match[6] || '',
        hash: match[7] || ''
    }
}

module.exports.getLocation = getLocation;
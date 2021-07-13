module.exports.getUrl = function(req) {
    const { protocol } = req;
    const hostname = req.get('host');

    return protocol + '://' + hostname;
}

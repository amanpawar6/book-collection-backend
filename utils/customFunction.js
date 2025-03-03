const _uniqBy = require('lodash/uniqBy');
const _map = require('lodash/map');

const errorDetails = (details) => {
    return _uniqBy(_map(details, ({ message, type, context }) => ({
        message: message.replace(/[""]/g, ''),
        key: context.key,
        // type,
    })), 'key');
}

module.exports = {
    errorDetails
}
const _uniqBy = require('lodash/uniqBy');
const _map = require('lodash/map');
const ObjectId = require('mongoose').Types.ObjectId;

const errorDetails = (details) => {
    return _uniqBy(_map(details, ({ message, type, context }) => ({
        message: message.replace(/[""]/g, ''),
        key: context.key,
        // type,
    })), 'key');
};

const isValidObjectId = (id) => {
    
    if(ObjectId.isValid(id)){
        if((String)(new ObjectId(id)) === id)
            return true;        
        return false;
    }
    return false;
}

module.exports = {
    errorDetails,
    isValidObjectId
}
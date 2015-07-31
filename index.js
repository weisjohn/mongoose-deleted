
module.exports = function(schema, options) {

    // default options
    if (typeof options !== "object")
        options = { select : false, history : false, toJSON : false };

    // add the schema path
    schema.add({
        deleted: {
            type: Boolean,
            default: false,
            select: options.select
        }
    });

    // extend the delete function
    schema.methods['delete'] = function(fn) {
        this.deleted = true;

        // integration with mongoose-history
        if (options.history && Array.isArray(this.history))
            this.history.push({ status: 'deleted' });

        this.save(fn);
    };

    // allow finds to be simple
    schema.pre('find', soft_delete_middleware);
    schema.pre('findOne', soft_delete_middleware);
    schema.pre('findOneAndUpdate', soft_delete_middleware);
    schema.pre('count', soft_delete_middleware);

    // hide the deleted field on toJSON calls
    if (!schema.options.toJSON) schema.options.toJSON = {};
    // store reference to previous transform
    var fn = schema.options.toJSON.transform || function() { };
    schema.options.toJSON.transform = function (doc, ret, opts) {

        // allow overrides in the toJSON call
        var del = options.toJSON;
        if (typeof opts.deleted !== 'undefined') del = opts.deleted;
        if (!del) { delete ret.deleted; }

        // call next transform
        fn(doc, ret, opts);
    }

}

// detect if a "deleted" key is on the object
function detect_deleted(obj) {
    var detected = false;
    Object.keys(obj).forEach(function(key) {
        if (key === "deleted") detected = true;
    });
    return detected;
}

// middleware to faciliate soft-delete finds
function soft_delete_middleware(next) {

    var cons = this._conditions, add_clause = true;

    // if the supplied query has specified any type of deleted, don't add
    if (detect_deleted(cons)) {
        add_clause = false;
    } else {
        ["$or", "$and"].forEach(function(key) {
            if (!cons[key] || !Array.isArray(cons[key])) return;
            cons[key].forEach(function(con) {
                if (detect_deleted(con)) add_clause = false;
            });
        });
    }

    if (add_clause) this.find({ deleted : false });

    next();
}

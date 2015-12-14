
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

    // generate methods on schema
    function action(name, bool) {
        schema.methods[name] = function(fn) {
            this.deleted = bool;

            // integration with mongoose-history
            if (options.history && Array.isArray(this.history))
                this.history.push({ status: name + 'd' });

            this.save(fn);
        };
    }

    action('delete', true);
    action('restore', false);

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
    };

};

// detect `deleted` or `_id` conditions
function detect(obj) {
    var keys = Object.keys(obj);
    return keys.indexOf('deleted') !== -1 || keys.indexOf('_id') !== -1;
}

// middleware to faciliate soft-delete finds
function soft_delete_middleware(next) {

    var cons = this._conditions, add_clause = true;

    if (detect(cons)) {
        add_clause = false;
    } else {
        ["$or", "$and"].forEach(function(key) {
            if (!cons[key] || !Array.isArray(cons[key])) return;
            cons[key].forEach(function(con) {
                if (detect(con)) add_clause = false;
            });
        });
    }

    if (add_clause) this.find({ deleted : false });

    next();
}

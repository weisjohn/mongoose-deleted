
module.exports = function(schema, options) {

    // default options
    if (typeof options !== "object")
        options = { select : false, history : false };

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

}

// middleware to faciliate soft-delete finds
function soft_delete_middleware(next) {

    if (typeof this._conditions === "object") {
        if (!this._conditions.deleted) {
            this.find({ deleted : false });
        }
    }
    if (typeof next === 'function') next();
}


function soft_delete_middleware(next) {
    this.find({ deleted : false });
    if (typeof next === 'function') next();
}

module.exports = function(schema, options) {

    // add the schema path
    schema.add({
        deleted: {
            type: Boolean,
            default: false
        }
    });

    // extend the delete function
    schema.methods['delete'] = function(fn) {
        this.deleted = true;
        if (options.history && this.history && Array.isArray(this.history))
            this.history.push({ status: 'deleted' });
        this.save(fn);
    };

    // allow finds to be simple
    schema.pre('find', soft_delete_middleware);
    // schema.pre('findOne', soft_delete_middleware);
    schema.pre('findOneAndUpdate', soft_delete_middleware);
    schema.pre('count', soft_delete_middleware);

}
var assert = require('assert');
var async = require('async');
var mongoose = require('mongoose');
var mongoose_deleted = require('./');

var user;

function models() {
    user = new mongoose.Schema({ name: String });
    mongoose_deleted(user);
    mongoose.model('user', user);
    user = mongoose.model('user', user);
}

function test() {

    var name = "John Q Public";
    var user1 = new user({ name : name });

    user1.save(function(err, doc) {
        user.findOne({ name : name }, function(err, doc) {
            assert.equal(err, null);
            assert.equal(doc.name, name);
            doc.delete(function(err) {
                user.findOne({ name: name }, function(err, docs) {
                    assert.equal(err, null);
                    assert.equal(docs, null);
                    disco();
                });
            });
        });
    });

}

// connect and test
mongoose.connect('mongodb://localhost/md-test', function() {
    models();
    test();
});

function disco() {
    if (!/node-dev$/.test(process.env._)) {
        mongoose.disconnect();
        process.exit(0);
    }
}

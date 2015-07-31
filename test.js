var async = require('async');
var assert = require('assert');
var mongoose = require('mongoose');
var mongoose_deleted = require('./');
var _ = require('lodash');

var user, cars;

function models() {

    user = new mongoose.Schema({ name: String });
    mongoose_deleted(user);
    user = mongoose.model('user', user);

    car = new mongoose.Schema({ name: String });
    mongoose_deleted(car, { select : true, toJSON : true });
    car = mongoose.model('car', car);

}

function test() {

    var name = "John Q Public";

    async.waterfall([
        function(cb) {
            user.remove({}, function(err) { cb(err); });
        },
        function(cb) {
            car.remove({}, function(err) { cb(err); });
        },
        function(cb) {
            var user1 = new user({ name : name });
            user1.save(function(err, doc) {
                assert.equal(doc.deleted, false, 'deleted should exist');
                assert.equal(doc.toJSON().deleted, null, 'deleted JSON should exist');
                cb(err);
            });
        },
        function(cb) {
            user.findOne({ name : name }, function(err, doc) {
                assert.equal(err, null);
                assert.equal(doc.name, name);
                assert.equal(doc.deleted, null, 'deleted should not exist');
                cb(null, doc);
            });
        },
        function(doc, cb) {
            user.findOne({ name : name }, { name : 1, deleted : 1 }, function(err, doc) {
                assert.equal(err, null);
                assert.equal(doc.name, name);
                assert.equal(doc.deleted, false, 'deleted should exist');
                assert.equal(doc.toJSON().deleted, null, 'deleted JSON should not exist');
                assert.equal(doc.toJSON({ deleted : true }).deleted, false, 'deleted JSON should exist');
                cb(null, doc);
            });
        },
        function(doc, cb) {
            doc.delete(function(err) {
                cb(err);
            });
        },
        function(cb) {
            user.findOne({ name: name }, function(err, doc) {
                assert.equal(err, null);
                assert.equal(doc, null);
                cb();
            });
        },
        function(cb) {
            user.findOne({ name: name, deleted: true }, function(err, doc) {
                assert.equal(err, null);
                assert.equal(doc.name, name, 'doc should exist');
                cb();
            });
        },
        function(cb) {
            user.findOne({ name: name, $or : [
                { deleted : { $exists: true } },
                { deleted : { $exists: false } },
            ] }, function(err, doc) {
                assert.equal(err, null);
                assert.equal(doc.name, name, 'doc should exist');
                cb();
            });
        },
        function(cb) {
            user.count(function(err, number) {
                assert.equal(number, 0, 'users.count() should equal 0');
                cb();
            });
        },
        function(cb) {
            user.count({ deleted : true },function(err, number) {
                assert.equal(number, 1, 'deleted users should be 1');
                cb();
            });
        },
        function(cb) {
            var car1 = new car({ name : "Jetta" });
            car1.save(function(err, doc) { cb(err); });
        },
        function(cb) {
            car.findOne({ name : "Jetta" }, function(err, doc) {
                assert.equal(doc.deleted, false, 'deleted should exist');
                assert.equal(doc.toJSON().deleted, false, 'deleted JSON should exist');
                assert.equal(doc.toJSON({ deleted : false }).deleted, null, 'deleted JSON should not exist');
                cb();
            });
        }
    ], disco);

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
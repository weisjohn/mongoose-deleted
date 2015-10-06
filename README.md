# mongoose-deleted

a soft-delete implementation utilizing mongoose middleware

### usage

```javascript
var mongoose = require('mongoose');
var mongoose_deleted = require('mongoose-deleted');
var user = new mongoose.Schema({ name: String });
mongoose_deleted(user);
user = mongoose.model('user', user);

var name = "John Q Public";
var user1 = new user({ name : name });

user1.save(function() {
    user.findOne({ name : name }, function(err, doc) {
        if (err || !doc) console.log('failed to find document');
        doc.delete(funciton(err) {
            user.findOne({ name: name }, function() {
                if (!doc) console.log('soft delete worked');
            })
        });
    });
});
```

### documents

`mongoose-deleted` utilizes mongoose middleware to transparently modify queries to select for documents that are not `{ deleted: true }`. Documents that are `.delete()`-ed will not be returned. To explicitly return documents that are deleted:

```javascript
schema.find({ deleted: true }, function(err, docs) {
    // ...
});
```

Additionally, the `deleted` boolean property is set by default to not be selected/returned on a document.

To have `deleted` normally returned:

```javascript
schema.plugin(mongoose_deleted, { select : true });
```

To have the `deleted` property included, [in addition](http://mongoosejs.com/docs/api.html#query_Query-select) to the normal properties:

```javascript
schema.findOne(query).select('+deleted').exec(function(err, doc) {
    console.log(doc.deleted);
});
```

Or, to retrieve the `deleted` property only on a particular query, manually select for it:

```javascript
schema.findOne({}, { deleted : 1 }, function(err, doc) {
    console.log(doc.deleted);
});
```



### toJSON

By default, `mongoose-deleted` hides the `deleted` property on `doc.toJSON()`. This is configurable in the options:

```javascript
schema.plugin(mongoose_deleted, { toJSON : true });
```

This can be overriden in a `toJSON()` call:

```javascript
var json = doc.toJSON({ deleted : true });
```


### history

`mongoose-deleted` allows an optional integration with [`mongoose-history-log`](https://www.npmjs.com/package/mongoose-history-log) by passing in the options:

```javascript
mongoose_deleted(schema, { history: true });
```

This will automatically insert a `{ status: 'deleted' }` object with the current time.
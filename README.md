# mongoose-deleted

a soft-delete implementation utilizing mongoose middleware

### usage

```javascript
var mongoose = require('mongoose');
var mongoose_deleted = require('mongoose-deleted');
var user = new mongoose.Schema({ name: String });
user = mongoose.model('user', user);
mongoose_deleted(user);

var name = "John Q Public";

var user1 = new user({ name : name });

user1.save(function() {
    user.findOne({ name : name, }, function(err, docs) {
        if (err || !doc) console.log('failed to find document');
        doc.delete(funciton(err) {
            user.findOne({ name: name }, function() {
                if (!doc) console.log('soft delete worked');
            })
        });
    });
});

```


`mongoose-deleted` allows an optional integration with [`mongoose-history-log`](https://www.npmjs.com/package/mongoose-history-log) by passing in a second parameter:

```javascriptgs
mongoose_deleted(schema, { history: true })
```

This will automatically insert a `{ status: 'deleted' }` object with the current time.
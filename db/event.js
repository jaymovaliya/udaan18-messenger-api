const ObjId = require('mongodb');

module.exports = (db) =>({
     get (id) => {
        const ans =
        return db.collection('events').find({_id: ObjectId(id)});
}
});
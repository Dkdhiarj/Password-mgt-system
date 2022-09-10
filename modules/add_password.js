const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true,});
var conn = mongoose.Collection;
// var conn = mongoose.connection;
var passSchema =new mongoose.Schema({
    password_category: {
        type: String,
        required: true,
        index:  {
            unique: true,
        },
    },

    project_name: {
        type: String,
        required: true,
        // index:  {
        //     unique: true,
        // },
    },

    password_details: {
        type: String,
        required: true,
        index:  {
            unique: true,
        },
    },

    date:{
        type: Date,
        default: Date.now
    }

});

var passModel = mongoose.model('password_details', passSchema);
module.exports = passModel;
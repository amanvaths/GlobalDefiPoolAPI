const mongoose = require("mongoose");
const admin = new mongoose.Schema({
    admin_name: { type: String },
    email: { type: String },
    hash_password: { type: String, required: true },
    admin_wallet: { type: Number, default: 0.00},
    repurchase_wallet: { type: Number, default: 0.00},
    owner_wallet_address: {type: String, default: ''},
    min_topup_amount: {type: Number, default: 1000},
    max_topup_amount: {type: Number, default: 10000},
}, {timestamps: true, collection:'Admin'})


module.exports = mongoose.model('Admin', admin);        

admin.methods = {
    authenticate: async function (password) {
        //return await bcrypt.compare(password, this.hash_password);
        return password == this.password;
    },
};



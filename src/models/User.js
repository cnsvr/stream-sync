const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true }
});

userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
}

module.exports = mongoose.model('User', userSchema);
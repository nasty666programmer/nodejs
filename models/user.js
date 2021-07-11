const {Schema,model} = require('mongoose');

const userSchema = new Schema({
    email:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    avatarUrl:String,
    resetToken:String,
    resetTokenExp:Date,
    cart:{
        items: [
            {
                count: {
                    type:Number,
                    required:true,
                    default:1
                },
                courseId: {
                    required:true,
                    ref:'Course',
                    type:Schema.Types.ObjectId
                }
            }
        ]
    }
})

userSchema.methods.addToCart = function(course) {
    console.log('addToCart: ',course)
    const items = [...this.cart.items]
    const idx = items.findIndex(el => {
        return el.courseId.toString() === course._id.toString();
    })

    if (idx >= 0) {
        items[idx].count = items[idx].count + 1;
    }else {
        items.push({
            courseId:course._id,
            count:1
        })
    }

    this.cart = {items}

    return this.save()
}

userSchema.methods.removeFromCart = function(id) {
    let items = [...this.cart.items];
    const idx = items.findIndex(c => {
        return c.courseId.toString() === id.toString()
    })

    if (items[idx].count === 1) {
        items.filter(c => c.courseId.toString() !== id.toString())
    }else {
        items[idx].count--
    }

    this.cart = {items}
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = [];
    return this.save();
}

module.exports = model('User',userSchema)
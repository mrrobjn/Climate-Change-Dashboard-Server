import mongoose from 'mongoose';
 async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/CCD')
    }
    catch(err){
        console.log(err)
    }
}
export  {connect} ;
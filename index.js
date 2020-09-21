const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost/products')
    .then(()=>console.log('connected to DB'))
    .catch(err=>console.log('couldnt connect to DB'))

const express = require('express');
const app =express();
app.use(express.json())



//posting new load by reoresentative
app.post('/representative/newLoad',async(req,res)=>{

  const result=await createLoad(req.body)
   res.send(result)
})
//get all loads to supervisor
app.get('/supervisor/loads',async(req,res)=>{
    res.send(await getLoads())
})
//get all loads of todat to supervisor
app.get('/supervisor/loads/today',async(req,res)=>{
    res.send(await findByDate())
})
//get all products to the representative
app.get('/products',(req,res)=>{
    res.send(products)
})
//login
app.post('/supervisor/login',async(req,res)=>{
    let user= await SuperVisor.findOne({email:req.body.email});
    if (!user) return res.status(400).send('Invalid email or password')

   const validPassword = await bcrypt.compare(req.body.password, user.password)
   if (!validPassword) return res.status(400).send('Invalid email or password')

   res.send(user._id)

})
app.post('/rep/login',async(req,res)=>{
    let user= await User.findOne({email:req.body.email});
    if (!user) return res.status(400).send('Invalid email or password')

   const validPassword = await bcrypt.compare(req.body.password, user.password)
   if (!validPassword) return res.status(400).send('Invalid email or password')

   res.send(user._id)
})
//get all reps
app.get('/supervisor/allrep',async(req,res)=>{
    const results =await User.find()
    console.log(results)
    res.send(results)
})
//expenses post
app.post('/rep/expenses',async(req,res)=>{
   res.send(await creatExpenses(req.body))
})
//get specifi representative expenses
app.get('/supervisor/repExp',async(req,res)=>{
    let repExp= await Expenses.find({rep_id:req.body.rep_id})
    res.send(repExp)

})

const port=process.env.PORT || 3000
app.listen(port,()=>console.log('listening at port 3000'))

const products=['لبناني صغير', 'لبناني كبير', 'لبناني وسط', 'فينو', 'فينو مجوز', 'فينو مشرط', 'كيزر','قرص', 'بقسماط', 'قراقيش', 'بسكويت', 'ميني بيتزا']


const loadsScema = new mongoose.Schema({
    date: {type:Date, default: Date.now },
    dateDay:Number,
    dateMonth:Number,
    dateYear:Number,
    clientName:String,
    rep_id: String,
    total: Number,
    paid: Number,
    laterPay: Number,
    lebSmall:Number,
    lebMid:Number,
    lebBig:Number,
    fino:Number,
    finoDouble:Number,
    finoStripped:Number,
    kaizar:Number,
    koras:Number,
    boqsomat:Number,
    karakeesh:Number,
    biscuits:Number,
    miniPizza:Number,
    bonus:Number
});

const Load= mongoose.model('Load',loadsScema);

async function createLoad(body){
    var d = new Date();
    var dateDay = d.getDate()
    var dateMonth =d.getMonth()+1
    var dateYear =d.getFullYear()
const load= new Load(body)
load.dateDay= dateDay
load.dateMonth=dateMonth
load.dateYear=dateYear
console.log('s',load)
const result =await load.save()
return result
}

async function getLoads(){
    const results =await Load.find()
    console.log(results)
    return results
}
getLoads()

async function findByDate(){
  var d = new Date();
  var dateDay = d.getDate()
  var dateMonth =d.getMonth()+1
  var dateYear =d.getFullYear()
  console.log('d',dateMonth)

 const todayLoads =  await Load.find({ dateDay: dateDay, dateMonth:dateMonth, dateYear}).exec();
  return todayLoads
}



const superVisorScema = new mongoose.Schema({
    name:String,
    email:{
        type:String,
        required:true,
        minlength:5,
        maxlength:255,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:5,
    },
    super_id: String,
    role:String,

});
const SuperVisor= mongoose.model('SuperVisor',superVisorScema);

const UserScema = new mongoose.Schema({
    name:String,
    email:{
        type:String,
        required:true,
        minlength:5,
        maxlength:255,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:5,
    },
    super_id: String,
    role:String,

});
const User= mongoose.model('User',UserScema);

async function createSuperVisor(){
    const salt =await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash('1234',salt);
const supervisor= new SuperVisor({
    name:'ahmed',
    email:'ahmedahmed@gmail.com',
    password:hashed,
    role:'super'
})
const result =await supervisor.save()
console.log(result)
}

async function createUser(){
    const salt =await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash('mandoop11',salt);
    const user= new User({
        name:'gamal',
        email:'mandoop1@gmail.com',
        password:hashed,
        role:'rep_1'
    })

    const result =await user.save()
    console.log(result)
    }




    const ExpensesScema = new mongoose.Schema({
        rep_id:String,
        solar:Number,
        car:Number,
        personal:Number
    })
    const Expenses= mongoose.model('Expenses',ExpensesScema);

    async function creatExpenses(exp){
        const expenses= new Expenses(exp)
        const result=await expenses.save()
        return result
    }
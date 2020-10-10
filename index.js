const jwt = require('jsonwebtoken')
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require('config');
//mongodb+srv://tokakamel2:tokaisthebest95@cluster0.rr1bh.mongodb.net/BAKERY?retryWrites=true&w=majority
//'mongodb://localhost:27017
mongoose
  .connect(
    "mongodb+srv://maryam:12345@cluster0.etzrn.mongodb.net/BEHIND-THE-SCENE?retryWrites=true&w=majority"
  )
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log("couldnt connect to DB"));

if (!config.get('jwtPrivateKey')){
  console.log('FATAL ERROR: jwtPrivateKey is not defined')
  process.exit(1);
}


const express = require("express");
const app = express();
app.use(express.json());

//add new user
app.post("/new/user", async (req, res) => {
  const user = await createUser(req).catch((err) => res.send(err));

  res.send(user);
});
app.post("/new/super", async (req, res) => {
  const result = await createSuperVisor(req).catch((err) => console.log(err));
  res.send(result);
});

//delete docs
app.get("/delete/doc", async (req, res) => {
  const id = req.body._id;
  const result = Load.find({ _id: id }).remove().exec();
  res.send(result);
});

//get all cleints
app.get("/allClients", async (req, res) => {
  const result = await getAllCleints(req);
  res.send(result);
});
//posting new load by reoresentative
app.post("/representative/newLoad", async (req, res) => {
  const result = await createLoad(req.body);
  res.send(result);
});
//get all loads to supervisor
app.get("/supervisor/loads", async (req, res) => {
  res.send(await getLoads());
});
//get all loads of todat to supervisor
app.get("/supervisor/loads/today", async (req, res) => {
  res.send(await findByDate(req.query));
});
//get products of specific client
app.get("/supervisor/loads/client", async (req, res) => {
  const result = await Load.findOne(req.query).catch(err=>res.send(err))
  res.send(result.product)

});
//get bill of specific client
app.get("/supervisor/loads/client/bill", async (req, res) => {
  const result = await Load.findOne(
    req.query
  ).select("total paid laterPay date dateDay dateMonth dateYear dateOnly time dateString")

  console.log(result);
  console.log('v');
  res.send(result);
});
//get all products to the representative
app.get("/products", (req, res) => {
  res.send(products);
});
//login
app.post("/supervisor/login", async (req, res) => {
  let user = await SuperVisor.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");
  const token = jwt.sign({_id:user._id},config.get('jwtPrivateKey'))
  res.header('x-auth-token',token).send(true);
});
app.post("/rep/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  res.send(user.rep_id);
});
//get all reps
app.get("/supervisor/allrep", async (req, res) => {
  const results = await User.find().select("-password -email");

  console.log(results);
  res.send(results);
});
//expenses post
app.post("/rep/expenses", async (req, res) => {
  res.send(await creatExpenses(req.body));
});
//get all expenses
app.get("/allExpenses", async (req, res) => {
  const result = await allExpenses(req).catch((err) => console.log(err));
  res.send(result);
});
//get specifi representative expenses
app.get("/supervisor/repExp", async (req, res) => {
  var d = new Date();
  var dateDay = d.getDate();
  var dateMonth = d.getMonth() + 1;
  var dateYear = d.getFullYear();
  let repExp = await Expenses.findOne({ rep_id: req.query.rep_id}).sort({"date":-1})
  console.log('qw',repExp)
  res.send(JSON.stringify(repExp.total))
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening at port 3000"));

const products = [
  { category: "لبناني صغير" },
  { category: "لبناني كبير" },
  { category: "فينو" },
  { category: "فينو مجوز" },
  { category: "فينو مشرط" },
  { category: "كيزر" },
  { category: "قرص" },
  { category: "بقسماط" },
  { category: "قراقيش" },
  { category: "بسكويت" },
  { category: "ميني بيتزا" },
];

const loadsScema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  dateDay: Number,
  dateMonth: Number,
  dateYear: Number,
  dateString:String,
  time:String,
  clientName: String,
  rep_id: Number,
  total: Number,
  paid: Number,
  laterPay: Number,
  product: { type: Array, default: undefined },
});

const Load = mongoose.model("Load", loadsScema);

async function createLoad(body) {
  var d = new Date();
  var dateDay = JSON.stringify(d.getDate());
  var dateMonth =JSON.stringify(d.getMonth() + 1);
  var dateYear = JSON.stringify(d.getFullYear());
  var timeHours =JSON.stringify(((d.getUTCHours()+2) %12)||12)
  var timeMin=JSON.stringify(d.getMinutes());
  var timeSec=JSON.stringify(d.getSeconds());
  var time = timeHours.concat(":",timeMin,":",timeSec)

  var dateString = dateDay.concat("/",dateMonth,"/",dateYear)
  body.clientName=body.clientName.trim()
  const load = new Load(body);
  load.dateDay = dateDay;
  load.dateMonth = dateMonth;
  load.dateYear = dateYear;
  load.dateString=dateString
  load.time=time
  console.log("s", load);
  const result = await load.save();
  return result;
}

async function getLoads() {
  const results = await Load.find().select("-date");
  console.log(results);
  return results;
}
getLoads();

async function findByDate(req) {
  var d = new Date();
  var dateDay = d.getDate();
  var dateMonth = d.getMonth() + 1;
  var dateYear = d.getFullYear();
  console.log("d", dateMonth);
  console.log(req.rep_id);
  const todayLoads = await Load.find({
    dateDay: dateDay,
    dateMonth: dateMonth,
    dateYear: dateYear,
    rep_id: req.rep_id,
  }).exec();
  return todayLoads;
}

const superVisorScema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  super_id: String,
  role: String,
});
const SuperVisor = mongoose.model("SuperVisor", superVisorScema);

const UserScema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  rep_id:String,
  role: String,
});
const User = mongoose.model("User", UserScema);

async function createSuperVisor(req) {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(req.body.password, salt, null, function (
    err,
    hash
  ) {
    console.log("password");
  });
  const supervisor = new SuperVisor({
    name: req.body.name,
    email: req.body.email,
    password: hashed,
    role: req.body.role,

  });
  const result = await supervisor.save();
  console.log(result);
  return result;
}

async function createUser(req) {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashed,
    role: req.body.role,
    rep_id: req.body.rep_id
  });

  const result = await user.save();
  console.log(result);
  return result;
}

async function createSpecific() {
  const salt = await bcrypt.genSalt(10);
  console.log("salt", salt);
  const hashed = await bcrypt.hash("admin100", salt);
  console.log("hashed", hashed);
  const user = new SuperVisor({
    name: "ahmed",
    email: "ahmed55@megadev.com",
    password: hashed,
    role: "admin",
  });

  const result = await user.save();
  console.log(result);
  return result;
}

const ExpensesScema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  rep_id: String,
  solar: Number,
  car: Number,
  personal: Number,
  total: Number,
});
const Expenses = mongoose.model("Expenses", ExpensesScema);

async function creatExpenses(exp) {
  const expenses = new Expenses(exp);
  const total = expenses.solar + expenses.car + expenses.personal;
  expenses.total = total;
  const result = await expenses.save();
  return result;
}
async function allExpenses(req) {
  var d = new Date();
  var dateDay = d.getDate();
  var dateMonth = d.getMonth() + 1;
  var dateYear = d.getFullYear();

  const results = await Expenses.find({ rep_id: req.query.rep_id, dateDay:dateDay,dateMonth:dateMonth,dateYear:dateYear})
    .select("total")
    .exec();
  return results;
}
async function getAllCleints(req) {
  const repid1 = req.query._id;
  const repid = req.query.rep_id;
  var d = new Date();
  var dateDay = d.getDate();
  var dateMonth = d.getMonth() + 1;
  var dateYear = d.getFullYear();

  console.log("repid", repid);
  const clients = await Load.find({ rep_id: repid,dateDay:dateDay,dateMonth:dateMonth,dateYear:dateYear})
    .select("clientName")
    .exec();

  console.log("cleints", clients);
  console.log(req.query._id);
  return clients;
}

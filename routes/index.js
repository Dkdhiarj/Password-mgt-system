var express = require('express');
var router = express.Router();
var userModule = require('../modules/user');
var bcrypt = require('bcryptjs'); 
var jwt = require('jsonwebtoken');
const { get } = require('mongoose');
const { check, validationResult } = require('express-validator');
var passCatModel =require('../modules/password_category');
var passModel =require('../modules/add_password');
// const passcatemodel = require('../modules/password_category');
var getPassCat= passCatModel.find({});
var getAllPass= passModel.find({});


if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

/* GET home page. */
// midddleware

function checkLoginUser(req,res,next){
  var userToken= localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

function checkEmail(req,res,next){
  var email= req.body.email;
  var checkexistemail = userModule.findOne({email:email});
  checkexistemail.exec((err,data)=>{
    if(err) throw err;
    if(data){
      return res.render('signup', { title: 'Password Management System' , msg: 'Email already exists'});    
    }
    next();
  });
}

function checkUsername(req,res,next){
  var uname= req.body.uname;
  var checkexistusername = userModule.findOne({username:uname});
  checkexistusername.exec((err,data)=>{
    if(err) throw err;
    if(data){
      return res.render('signup', { title: 'Password Management System' , msg: 'Username already exists'});    
    } 
    next();
  });
}

router.get('/', function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard');
  }
else{

  res.render('index', { title: 'Password Management System' , msg:''});
}
});

// router.post('/', async function(req, res, next) {
  router.post('/',function(req, res, next) {
  var username= req.body.uname;
  // console.log(username)
  var password= req.body.password;
  // console.log(password);
  // var checkuser = await userModule.findOne({username:username});
  var checkuser = userModule.findOne({username:username});
  console.log(checkuser);

  // if(checkuser==null){
  //   res.render('index', { title: 'Password Management System' , msg: 'Enter valid username.'});
  // }
  // else{

  checkuser.exec((err,data)=>{
    if(err) throw err; 
    
    if(data !== null) {

    var getPassword = data.password;
    var getUserId = data._id;
    if(bcrypt.compareSync(password,getPassword)){
      var token = jwt.sign({ userID: getUserId }, 'loginToken');
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUser', username);
      // res.render('index', { title: 'Password Management System' , msg: 'User Logged in Successfully'});
      //now page will be redirected not rendered
      res.redirect('/dashboard');

    }
    else{
      res.render('index', { title: 'Password Management System' , msg: 'Invalid username and password.'});
    }
  }
    
    else{
      res.render('index', { title: 'Password Management System' , msg: 'Invalid username and password.'});
    }
 
});
  // }
});

router.get('/dashboard',checkLoginUser, function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  res.render('dashboard', { title: 'Password Management System' ,loginUser:loginUser, msg: ''});
});

router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');

  // res.render('logout', { title: 'Password Management System' , msg: ''});
});

router.get('/signup', function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard');
  }
else{
  res.render('signup', { title: 'Password Management System' , msg: ''});
}
});
//midddleware checkEmail
router.post('/signup', checkEmail,checkUsername, function(req, res, next) {
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;
// const {uname,email,password}= req.body
// console.log(uname, email, password)
//destructuring

  if(password !=confpassword){
    res.render('signup', { title: 'Password Management System',msg: 'Password do not match'});
  
  } else {  
    
    password= bcrypt.hashSync(req.body.password,10);
  var userDetails= new userModule({
    username: username,
    email: email,
    password: password
  });

  userDetails.save((err,doc)=>{
    if(err) throw err;
  res.render('signup', { title: 'Password Management System',msg: 'User Registered Successfully' });
  });

  }
});


router.get('/addNewCategory',checkLoginUser, function(req, res, next) {

  var loginUser= localStorage.getItem('loginUser');
  
    res.render('addNewCategory', { title: 'Password Category Lists',loginUser:loginUser,errors:'', success:''});
  
});

router.post('/addNewCategory',checkLoginUser,[check('passwordCategory','Enter Password Category Name').isLength({ min: 1 })],function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('addNewCategory', { title: 'Password Category Lists',loginUser:loginUser, errors: errors.mapped(), success:''});
  }
  else{
    var passCatName= req.body.passwordCategory;
    var passCatDetails= new passCatModel({
      password_category: passCatName
    });
    
    passCatDetails.save(function(err,doc){
      if (err) throw err;
      res.render('addNewCategory', { title: 'Password Category Lists',loginUser:loginUser ,errors:'', success:'Password Category inserted successfully.'});

    });
  }

});

router.get('/passwordCategory', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('passwordCategory', { title: 'Password Category Lists' ,loginUser:loginUser , records: data});
});
});

router.get('/passwordCategory/delete/:id', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  var passcat_id= req.params.id;
  // console.log(pascat_id);
  var passdelete= passCatModel.findByIdAndDelete(passcat_id);
  passdelete.exec(function(err){
    if(err) throw err;
    res.redirect('/passwordCategory');
});
});

router.get('/passwordCategory/edit/:id', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  var passcat_id= req.params.id;
  // console.log(pascat_id);
  var getpassCategory= passCatModel.findById(passcat_id);
  getpassCategory.exec(function(err,data){
    if(err) throw err;
    res.render('edit_pass_category', { title: 'Password Category Lists' ,loginUser:loginUser ,errors:'', success:'', records: data , id:passcat_id });
  });
});

router.post('/passwordCategory/edit/', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  var passcat_id= req.body.id;
  var passwordCategory= req.body.passwordCategory;
  // console.log(pascat_id);
  var updatePassCat= passCatModel.findByIdAndUpdate(passcat_id , {password_category:passwordCategory });
  updatePassCat.exec(function(err,doc){
    if(err) throw err;
    res.redirect('/passwordCategory');
  });
});



router.get('/addNewPassword', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  getPassCat.exec(function (err,data){
    if(err) throw err;
    res.render('addNewPassword', { title: 'Password Category Lists', loginUser:loginUser , records: data, success: ''});
  });
});

router.post('/addNewPassword', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  var pass_cat = req.body.pass_cat;
  var project_name = req.body.project_name;
  var pass_details =req.body.pass_details;
// var passModel =require('../modules/add_password');
var password_details = new passModel({
  password_category: pass_cat,
  project_name:project_name, 
  password_details : pass_details

});  
    password_details.save(function(err,data){
      getPassCat.exec(function (err,data){
        if(err) throw err;
        res.render('addNewPassword', { title: 'Password Category Lists', loginUser:loginUser , records: data, success : 'Password Details inserted successfully.'});
    })
  });
});

router.get('/viewAllPassword/', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  var perPage = 3;
  var page = 1;

  getAllPass.skip((perPage * page) - perPage)
  .limit(perPage).exec(function(err,data){
    if(err) throw err;
    passModel.countDocuments({}).exec((err,count)=>{ 
    res.render('viewAllPassword', { title: 'Password Category Lists', 
    loginUser:loginUser ,
     records: data,
      current: page,
      pages: Math.ceil(count / perPage) });
  });
}); 
});

router.get('/viewAllPassword/:page', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  var perPage = 3;
  var page = req.params.page || 1;

  getAllPass.skip((perPage * page) - perPage)
  .limit(perPage).exec(function(err,data){
    if(err) throw err;
    passModel.countDocuments({}).exec((err,count)=>{ 
    res.render('viewAllPassword', { title: 'Password Category Lists', 
    loginUser:loginUser ,
     records: data,
      current: page,
      pages: Math.ceil(count / perPage) });
  });
});
});

router.get('/password-detail/', checkLoginUser,function(req, res, next) {
 res.redirect('/dashboard');
});

router.get('/password-detail/edit/:id', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  var id= req.params.id;
  var getPassDetails= passModel.findById({_id:id});

  getPassDetails.exec(function(err,data){
    if(err) throw err;
    getPassCat.exec(function (err,data1){
    res.render('edit_password_detail', { title: 'Password Category Lists', loginUser:loginUser,success:'',records:data1, record: data});
  });
});
 });

 router.post('/password-detail/edit/:id', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  var id= req.params.id;
  var pass_cat= req.body.pass_cat;
  var project_name= req.body.project_name;
  var pass_details= req.body.pass_details;
  passModel.findOneAndUpdate(id,{password_category: pass_cat, project_name: project_name ,password_details:pass_details }).exec(function(err){
    if(err) throw err;
  var getPassDetails= passModel.findById({_id:id});
  getPassDetails.exec(function(err,data){
    if(err) throw err;
    getPassCat.exec(function (err,data1){
    res.render('edit_password_detail', { title: 'Password Category Lists', loginUser:loginUser,success:'Password Updated Successfully.',records:data1, record: data});
  });
  });
});
 });

 router.get('/password-detail/delete/:id', checkLoginUser,function(req, res, next) {
  var loginUser= localStorage.getItem('loginUser');
  var id= req.params.id;
  // console.log(pascat_id);
  var passdelete= passModel.findByIdAndDelete(id);
  passdelete.exec(function(err){
    if(err) throw err;
    res.redirect('/viewAllPassword');
});
});

module.exports = router;

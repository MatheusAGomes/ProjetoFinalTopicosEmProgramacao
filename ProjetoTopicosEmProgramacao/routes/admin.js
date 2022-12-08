const express = require('express');
const router = express();
const Loaders = require('../startdb.js')
const UserModel = require('../Models/userModel.js')
router.set('view engine','ejs')

let emails;
let tamanho_do_array;
let objeto_do_usuario;

Loaders.start();

router.get('/', async(req, res, next) => {
  res.render(__dirname+'/views/index.ejs')
  emails = await UserModel.find();
  console.log(emails)
  console.log(emails.length)
  tamanho_do_array = emails.length;
});
/*
router.get('/css', (req, res, next) => {
  res.sendFile()
});
*/
router.post('/', (req, res, next) => {

  for (let index = 0; index < tamanho_do_array; index++) {
    if (req.body.userText == emails[index].email) {
      if(req.body.senhaText == emails[index].senha)
      {

      
        res.redirect(`/DashBord/${emails[index]._id.toString()}`)
      }
  }
  }
  
  
});

router.get('/NovoUsuario',  (req, res, next) => {
  res.sendFile(__dirname+'/views/CreateCount.html');
  
});

router.post('/NovoUsuario', async (req, res, next) => {
  //mandando para o banco
        let objeto = {
          email:req.body.userEmail,
          senha:req.body.userSenha,
          name:req.body.userNome,
        }
        
        for (let index = 0; index < tamanho_do_array; index++) {
          if (req.body.userEmail == emails[index].email) {
            if(req.body.userSenha == emails[index].senha)
            {
              res.redirect('/NovoUsuario');
            }
        }
        }
        const createCount =  await UserModel.create(objeto)
        res.redirect('/');
        

});



router.get('/DashBord/:id', async(req, res, next) => {
  let valordoid = req.params.id
  let teste;
  console.log(valordoid)
  objetodousuario =  await UserModel.find({_id:'639113566d8e6ef04676690c'})
 console.log(objetodousuario)
  res.render(__dirname+'/views/DashBord.ejs',{NomeDoUsuario:objetodousuario[0].name})
});







module.exports = router;


/*

router.get('/Cadastro', (req, res, next) => {
  res.send(
    '<form action="/Cadastro" method="POST"><label> User </label><input type="text" name="user"><label> Password </label><input type="text" name="pass"><button type="submit">Cadastrar</button></form>'
  );
});

router.post('/', (req, res, next) => {
  
 for (let index = 0; index < Lista.length; index++) {
  console.log(Lista[index].usuario)
  if(Lista[index].usuario == req.body.user)
  {
    if (Lista[index].senha == req.body.pass) {
      res.redirect('/Logado');
    }
  }
  
 }
  
});

router.post('/Cadastro', (req, res, next) => {
  let usuario =(req.body.user);
  let senha = (req.body.pass);

  Lista.push({usuario,senha})
  console.log(Lista)

  res.redirect('/');
});
*/

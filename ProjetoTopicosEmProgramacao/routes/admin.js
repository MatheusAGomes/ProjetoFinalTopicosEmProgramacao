const express = require('express');
const router = express();
const Loaders = require('../startdb.js')
const UserModel = require('../Models/userModel.js');

const { default: axios } = require('axios');
router.set('view engine','ejs')

//"https://www.googleapis.com/books/v1/volumes?q=HarryPotter&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI";
let emails;
let tamanho_do_array;
let objeto_do_usuario;

Loaders.start();

router.get('/', async(req, res, next) => {
  res.render(__dirname+'/views/index.ejs')
  emails = await UserModel.find();
  tamanho_do_array = emails.length;
});
/*
router.get('/css', (req, res, next) => {
  res.sendFile()
});
*/




/*



LOGIN




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




/*



NovoUsuario



*/

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




/*



DASHBORD




*/







router.get('/DashBord/:id', async(req, res, next) => {
  let valordoid = req.params.id
  let teste;
  objetodousuario =  await UserModel.find({_id:'639113566d8e6ef04676690c'})
  res.render(__dirname+'/views/DashBord.ejs',{NomeDoUsuario:objetodousuario[0].name})
});






/*



MINHA PESQUISA




*/

router.get('/MinhaPesquisa/:id', async(req, res, next) => {

  let valordoid = req.params.id
  let teste;
  objetodousuario =  await UserModel.find({_id:'639113566d8e6ef04676690c'})
  res.render(__dirname+'/views/MinhaPesquisa.ejs',{NomeDoUsuario:objetodousuario[0].name})
});
router.post('/MinhaPesquisa/:id', async(req, res, next) => {
  let valordoid = req.params.id
  let teste;
  objetodousuario =  await UserModel.find({_id:'639113566d8e6ef04676690c'})

  let nomeDoLivro = req.body.NomeDoLivro
  console.log(nomeDoLivro)

  let apigoogleBook = `https://www.googleapis.com/books/v1/volumes?q=${nomeDoLivro}&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  
  //console.log(apigoogleBook)

  let arrayDeResposta = await axios.get(apigoogleBook);
  //console.log(arrayDeResposta.data.items[0])

  let objetoLivro = {
    Nome:arrayDeResposta.data.items[0].volumeInfo.title,
    autor:arrayDeResposta.data.items[0].volumeInfo.authors[0],
    description:arrayDeResposta.data.items[0].volumeInfo.description,
    quantidadedePaginas:arrayDeResposta.data.items[0].volumeInfo.pageCount,
  }

  res.redirect(`/MinhaPesquisaComResposta/${valordoid}/${objetoLivro.Nome}/${objetoLivro.autor}/${objetoLivro.description}/${objetoLivro.quantidadedePaginas}/`);

  //res.render(__dirname+`/views/MinhaPesquisaComResultados.ejs`,{NomeDoLivro:objetoLivro.Nome,Autor:objetoLivro.autor,description:objetoLivro.description,quantidadedePaginas:objetoLivro.quantidadedePaginas})
});


router.post('/MinhaPesquisaComResposta/:id?/:nome?/:autor?/:description/:quantidadedePaginas?', async(req, res, next) => {
console.log(objetoLivro)
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

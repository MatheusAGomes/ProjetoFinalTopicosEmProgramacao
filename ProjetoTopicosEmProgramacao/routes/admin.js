const express = require('express');
const router = express();
const Loaders = require('../startdb.js')
const UserModel = require('../Models/userModel.js');

let axios = require('axios');
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

router.get('/indexcss', (req, res, next) => {
  res.sendFile(__dirname+'/views/index.css')
});

router.get('/resetcss', (req, res, next) => {
  res.sendFile(__dirname+'/views/reset.css')
});
router.get('/imgreading', (req, res, next) => {
  res.sendFile(__dirname+'/views/Reading....svg')
});


/*



LOGIN




*/
router.post('/', (req, res, next) => {

  for (let index = 0; index < tamanho_do_array; index++) {
    if (req.body.userText == emails[index].email) {
      if(req.body.senhaText == emails[index].senha)
      {

      
       return  res.redirect(`/DashBord/${emails[index]._id.toString()}`)
      }
  }
  }
  
  
});




/*



NovoUsuario



*/

router.get('/NovoUsuario',  (req, res, next) => {
  res.render(__dirname+'/views/CreateCount.ejs');
  
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
  let quantidadedepaginas = 0;
  let quantidadedeLivros = 0;
  objetodousuario =  await UserModel.find({_id:valordoid})
 
  //pegando o numero de paginas lidas
 
  
  try {
    let arrayDeLivrosDoUsario = objetodousuario[0].livros

    for (let index = 0; index < arrayDeLivrosDoUsario.length; index++) {
      quantidadedepaginas +=  parseInt(arrayDeLivrosDoUsario[index].numeroDePaginasLivro, 10);
  }

  } catch (error) {
    
  }

  // numero de livros setados como lido
  try {
    for (let index = 0; index < arrayDeLivrosDoUsario.length; index++) {
      let arrayDeLivrosDoUsario = objetodousuario[0].livros
  
      if(arrayDeLivrosDoUsario[index].situacaoDoLivro == 'valor2')
      {
        quantidadedeLivros += 1;
      }
    }
    
  } catch (error) {
    
  }
  
 

  

  res.render(__dirname+'/views/DashBord.ejs',{NomeDoUsuario:objetodousuario[0].name,quantidadedepaginas:quantidadedepaginas,quantidadedelivros:quantidadedeLivros})
});



router.post('/DashBord/:id', async(req, res, next) => {

  let valordoid = req.params.id
  let teste;
  console.log(req.body)
});


/*



MINHA PESQUISA




*/

router.get('/MinhaPesquisa/:id', async(req, res, next) => {

  let valordoid = req.params.id
  let teste;
  objetodousuario =  await UserModel.find({_id:valordoid})
  res.render(__dirname+'/views/MinhaPesquisa.ejs',{NomeDoUsuario:objetodousuario[0].name})
});
router.post('/MinhaPesquisa/:id', async(req, res, next) => {
  let valordoid = req.params.id
  let teste;
  objetodousuario =  await UserModel.find({_id:valordoid})

  let nomeDoLivro = req.body.NomeDoLivro.trim()
  console.log(nomeDoLivro)

  let apigoogleBook = `https://www.googleapis.com/books/v1/volumes?q=${nomeDoLivro}&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  
  //console.log(apigoogleBook)

  let arrayDeResposta = await axios.get(apigoogleBook);
  console.log(arrayDeResposta.data.items[0])

  let objetoLivro = {
    Nome:arrayDeResposta.data.items[0].volumeInfo.title,
    autor:arrayDeResposta.data.items[0].volumeInfo.authors[0],
    description:arrayDeResposta.data.items[0].volumeInfo.description,
    quantidadedePaginas:arrayDeResposta.data.items[0].volumeInfo.pageCount,
  }

  res.redirect(`/MinhaPesquisaComResposta/${valordoid}/book/${arrayDeResposta.data.items[0].id}`);

  //res.render(__dirname+`/views/MinhaPesquisaComResultados.ejs`,{NomeDoLivro:objetoLivro.Nome,Autor:objetoLivro.autor,description:objetoLivro.description,quantidadedePaginas:objetoLivro.quantidadedePaginas})
});


router.get('/MinhaPesquisaComResposta/:id/book/:idbook', async(req, res, next) => {
console.log(req.params.id)
console.log(req.params.idbook)

let valordoid = req.params.id
  let teste;
  objetodousuario =  await UserModel.find({_id:req.params.id})

let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${req.params.idbook}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`

let arrayDeResposta = await axios.get(pegando_livro_pelo_id);
console.log(arrayDeResposta.data.volumeInfo.title)
  res.render(__dirname+"/views/MinhaPesquisaComResposta.ejs",{NomeDoUsuario:objetodousuario[0].name,NomeDoLivro:arrayDeResposta.data.volumeInfo.title,Autor:arrayDeResposta.data.volumeInfo.authors[0],description:arrayDeResposta.data.volumeInfo.description,quantidadedePaginas:arrayDeResposta.data.volumeInfo.pageCount})
});




router.post('/MinhaPesquisaComResposta/:id/book/:idbook', async(req, res, next) => {
  let valordoid = req.params.id
  let teste;
  objetodousuario =  await UserModel.find({_id:valordoid})

  let nomeDoLivro = req.body.NomeDoLivro.trim()
  console.log(nomeDoLivro)

  let apigoogleBook = `https://www.googleapis.com/books/v1/volumes?q=${nomeDoLivro}&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  

  let arrayDeResposta = await axios.get(apigoogleBook);
  console.log(arrayDeResposta.data.items[0])

  let objetoLivro = {
    Nome:arrayDeResposta.data.items[0].volumeInfo.title,
    autor:arrayDeResposta.data.items[0].volumeInfo.authors[0],
    description:arrayDeResposta.data.items[0].volumeInfo.description,
    quantidadedePaginas:arrayDeResposta.data.items[0].volumeInfo.pageCount,
  }

  res.redirect(`/MinhaPesquisaComResposta/${valordoid}/book/${arrayDeResposta.data.items[0].id}`);

  //res.render(__dirname+`/views/MinhaPesquisaComResultados.ejs`,{NomeDoLivro:objetoLivro.Nome,Autor:objetoLivro.autor,description:objetoLivro.description,quantidadedePaginas:objetoLivro.quantidadedePaginas})
});

router.get('/DashBord/:id/CadastroDeLivro', async(req, res, next) => {
  let valordoid = req.params.id
  let teste;
  objetodousuario =  await UserModel.find({_id:valordoid})
  res.render(__dirname+"/views/CadastroDeLivro.ejs")
});
router.post('/DashBord/:id/CadastroDeLivro', async(req, res, next) => {
  let valordoid = req.params.id
  
  let nomeDoLivro = req.body.userNomeDoLivro.trim()
  console.log(nomeDoLivro)

  let apigoogleBook = `https://www.googleapis.com/books/v1/volumes?q=${nomeDoLivro}&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  

  let arrayDeResposta = await axios.get(apigoogleBook);
  // peguei o id
  let iddoLivro = arrayDeResposta.data.items[0].id
  console.log(iddoLivro)
  //situacao
  let situacaoDoLivro;
   situacaoDoLivro = req.body.select
  let numeroDePaginasLivro;
  numeroDePaginasLivro = req.body.NumeroDePaginas

   let objetoNovoLivro = {idLivro:iddoLivro,situacaoDoLivro:situacaoDoLivro,numeroDePaginasLivro:numeroDePaginasLivro}

   //pegando o array do usuario
  objetodousuario =  await UserModel.find({_id:valordoid})
  let arrayDeLivrosDoUsario = objetodousuario[0].livros;
  console.log(arrayDeLivrosDoUsario)
  //colocando os novosLivros
  arrayDeLivrosDoUsario.push(objetoNovoLivro)
  console.log(arrayDeLivrosDoUsario)

  await UserModel.findOneAndUpdate({
    _id: valordoid
}, {
    $set: {
        livros: arrayDeLivrosDoUsario
    }
}, {
    new: true // retorna o novo objeto
})

return  res.redirect(`/DashBord/${valordoid}`)
});




router.get('/DashBord/:id/AlterarLivro/:posicaodolivro', async(req, res, next) => {
  let valordoid = req.params.id
  let teste;
  objetodousuario =  await UserModel.find({_id:valordoid})
  res.render(__dirname+"/views/CadastroDeLivro.ejs")
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

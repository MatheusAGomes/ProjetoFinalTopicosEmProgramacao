const express = require('express'),
    router = express(),
    Loaders = require('../startdb.js'),
    UserModel = require('../Models/userModel.js'),
    path = require('path'),
    bcrypt = require('bcrypt'),
    axios = require('axios');

const saltRounds = 10

router.set('view engine','ejs')
router.use('/public', express.static(path.resolve(__dirname, 'public')));

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



LOGIN




*/
router.post('/', async (req, res, next) => {
    const user = await emails.find((x) => x.email === req.body.userText)
    console.log(user)
    if (user) {
        const cmp = await bcrypt.compare(req.body.senhaText, user.senha);
        if (cmp) {
            console.log('successful login')
            return res.redirect(`/DashBord/${user._id.toString()}`)
        } else {
            console.log("Wrong username or password.")
            return
        }
    } else {
        console.log("Wrong username or password.")
        return
    }
});


/*



NovoUsuario



*/

router.get('/NovoUsuario', (req, res, next) => {
    res.render(__dirname + '/views/CreateCount.ejs');
});

router.post('/NovoUsuario', async (req, res, next) => {
    if (req.body.userSenha !== req.body.userConfirmeSenha) {
        console.log('different passwords')
        return res.redirect('/NovoUsuario')
    }
    if (emails.some((x) => x.email === req.body.userEmail)) {
        console.log('existing email')
        return res.redirect('/NovoUsuario')
    }
    //hash the password
    const hashedPwd = await bcrypt.hash(req.body.userSenha, saltRounds)

    let objeto = {
        email: req.body.userEmail,
        senha: hashedPwd,
        name: req.body.userNome,
    }

    const createCount = await UserModel.create(objeto)
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
    let arrayDeLivrosDoUsario = objetodousuario[0].log
//
    for (let index = 0; index < arrayDeLivrosDoUsario.length; index++) {
      quantidadedepaginas +=  parseInt(arrayDeLivrosDoUsario[index].paginas, 10);
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
  
 

  

  res.render(__dirname+'/views/DashBord.ejs',{NomeDoUsuario:objetodousuario[0].name,quantidadedepaginas:quantidadedepaginas,quantidadedelivros:quantidadedeLivros,usuarioID:valordoid})
});



router.post('/DashBord/:id', async(req, res, next) => {

  let valordoid = req.params.id
  let teste;
  console.log(req.body)
});


/*



MINHA PESQUISA




*/

// router.get('/MinhaPesquisa/:id', async(req, res, next) => {

//   let valordoid = req.params.id
//   let teste;
//   objetodousuario =  await UserModel.find({_id:valordoid})
//   res.render(__dirname+'/views/MinhaPesquisaComResposta.ejs',{NomeDoUsuario:objetodousuario[0].name,})
// });
// router.post('/MinhaPesquisa/:id', async(req, res, next) => {
//   let valordoid = req.params.id
//   let teste;
//   objetodousuario =  await UserModel.find({_id:valordoid})

//   let nomeDoLivro = req.body.NomeDoLivro.trim()
//   console.log(nomeDoLivro)

//   let apigoogleBook = `https://www.googleapis.com/books/v1/volumes?q=${nomeDoLivro}&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  
//   //console.log(apigoogleBook)

//   let arrayDeResposta = await axios.get(apigoogleBook);
//   console.log(arrayDeResposta.data.items[0])

//   let objetoLivro = {
//     Nome:arrayDeResposta.data.items[0].volumeInfo.title,
//     autor:arrayDeResposta.data.items[0].volumeInfo.authors[0],
//     description:arrayDeResposta.data.items[0].volumeInfo.description,
//     quantidadedePaginas:arrayDeResposta.data.items[0].volumeInfo.pageCount,
//   }

//   res.redirect(`/MinhaPesquisaComResposta/${valordoid}/book/${arrayDeResposta.data.items[0].id}`);

//   //res.render(__dirname+`/views/MinhaPesquisaComResultados.ejs`,{NomeDoLivro:objetoLivro.Nome,Autor:objetoLivro.autor,description:objetoLivro.description,quantidadedePaginas:objetoLivro.quantidadedePaginas})
// });


router.get(['/MinhaPesquisaComResposta/:id/book/','/MinhaPesquisaComResposta/:id/book/:idbook'], async(req, res, next) => {


  let nomedoUsuario = ""
  let titulo =""
  let autor = ""
  let description = ""
  let numeroDePaginasLivro = ""
  let id = req.params.id;
  try {
  console.log(req.params.id)
  console.log(req.params.idbook)
  
  let valordoid = req.params.id
    let teste;
    objetodousuario =  await UserModel.find({_id:req.params.id})
  
  let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${req.params.idbook}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  
  let arrayDeResposta = await axios.get(pegando_livro_pelo_id);
  //console.log(arrayDeResposta.data.volumeInfo.title)



  nomedoUsuario = objetodousuario[0].name
  titulo= arrayDeResposta.data.volumeInfo.title
  console.log(titulo)
  autor = arrayDeResposta.data.volumeInfo.authors[0]
  description = arrayDeResposta.data.volumeInfo.description
  numeroDePaginasLivro = arrayDeResposta.data.volumeInfo.pageCount;
  return res.render(__dirname+"/views/MinhaPesquisaComResposta.ejs",{NomeDoUsuario:nomedoUsuario,NomeDoLivro:titulo,Autor:autor,description:description,quantidadedePaginas:numeroDePaginasLivro,usuarioID:id})
  
} catch (error) {
  
}
 



res.render(__dirname+"/views/MinhaPesquisaComResposta.ejs",{NomeDoUsuario:nomedoUsuario,NomeDoLivro:titulo,Autor:autor,description:description,quantidadedePaginas:numeroDePaginasLivro,usuarioID:id})

});




router.post(['/MinhaPesquisaComResposta/:id/book/','/MinhaPesquisaComResposta/:id/book/:idbook'], async(req, res, next) => {
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
  //console.log(nomeDoLivro)

  let apigoogleBook = `https://www.googleapis.com/books/v1/volumes?q=${nomeDoLivro}&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  

  let arrayDeResposta = await axios.get(apigoogleBook);
  // peguei o id
  let iddoLivro = arrayDeResposta.data.items[0].id
  let imagemdolivro
  console.log(arrayDeResposta.data.items[0])
  if(arrayDeResposta.data.items[0].volumeInfo.imageLinks == undefined)
  {
    imagemdolivro = null
  }
  else
  {
    imagemdolivro= arrayDeResposta.data.items[0].volumeInfo.imageLinks.thumbnail
  }
 // console.log(iddoLivro)
  //situacao
  let situacaoDoLivro;
   situacaoDoLivro = req.body.select
  let numeroDePaginasLivro;
  numeroDePaginasLivro = req.body.NumeroDePaginas

   let objetoNovoLivro = {idLivro:iddoLivro,situacaoDoLivro:situacaoDoLivro,img:imagemdolivro}

   //pegando o array do usuario
  objetodousuario =  await UserModel.find({_id:valordoid})
  let arrayDeLivrosDoUsario = objetodousuario[0].livros;
  //console.log(arrayDeLivrosDoUsario)
  //colocando os novosLivros
  arrayDeLivrosDoUsario.push(objetoNovoLivro)
  //console.log(arrayDeLivrosDoUsario)

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
  //alteracao a partir da posicao do array
  //0
  let valordoid = req.params.id
  let valorDaPosicao = req.params.posicaodolivro;
  objetodousuario =  await UserModel.find({_id:valordoid})
  let livro = objetodousuario[0].livros[valorDaPosicao]

  let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${livro.idLivro}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  let arrayDeResposta = await axios.get(pegando_livro_pelo_id);

  let nomeDoLivro = arrayDeResposta.data.volumeInfo.title

  
  
  res.render(__dirname+"/views/AlterarLivro.ejs",{NomeDoLivro:nomeDoLivro})
});


router.post('/DashBord/:id/AlterarLivro/:posicaodolivro', async(req, res, next) => {
  //alteracao a partir da posicao do array
  //0
  let valordoid = req.params.id
  let valorDaPosicao = req.params.posicaodolivro;

  //pegando os valores att do livro
  //id: eu tenho o nome do livro colocado 
  let nomedoLivro = req.body.userNomeDoLivro;
  let apigoogleBook = `https://www.googleapis.com/books/v1/volumes?q=${nomedoLivro}&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  let arrayDeResposta = await axios.get(apigoogleBook);
  let iddoLivro = arrayDeResposta.data.items[0].id
  console.log(arrayDeResposta.data.items[0])
  let imagemdolivro
 // console.log(arrayDeResposta.data.items[0].volumeInfo)
  if(arrayDeResposta.data.items[0].volumeInfo.imageLinks == undefined)
  {
    imagemdolivro = null
  }
  else
  {
    imagemdolivro= arrayDeResposta.data.items[0].volumeInfo.imageLinks.thumbnail
  }

  let livroatt = {idLivro:iddoLivro,situacaoDoLivro:req.body.select,img:imagemdolivro}

  let objetodousuario =  await UserModel.find({_id:valordoid})
  let arrayDeLivrosDoUsario = objetodousuario[0].livros;
  arrayDeLivrosDoUsario[valorDaPosicao] = livroatt
 // console.log(arrayDeLivrosDoUsario)

  await UserModel.findOneAndUpdate({
    _id: valordoid
}, {
    $set: {
        livros: arrayDeLivrosDoUsario,
      }
}, {
    new: true // retorna o novo objeto
})
  

  
  res.redirect(`/DashBord/${valordoid}/MinhaLeitura/`)
  
});



router.get('/DashBord/:id/MinhaLeitura/', async(req, res, next) => {
  let valordoid = req.params.id
  objetodousuario =  await UserModel.find({_id:valordoid})
  let arryLivros = objetodousuario[0].livros
  console.log(arryLivros)
  let arrayParaSerLido = [];
  let porcentagem;

  //peagando a soma das paginas lidas de um livro


 
  let numerolido = 0;

  //pegando o nome do livro com base no id

  for (let index = 0; index < arryLivros.length; index++) {

    for (let j = 0; j < objetodousuario[0].log.length; j++) {

      if (arryLivros[index].idLivro == objetodousuario[0].log[j].iddoLivro) {
          numerolido += parseInt(objetodousuario[0].log[j].paginas,10)
      }
      
    }

    let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${arryLivros[index].idLivro}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
    let arrayDeResposta = await axios.get(pegando_livro_pelo_id);
   // console.log(arrayDeResposta)

   let situacaoDoLivro = arryLivros[index].situacaoDoLivro
  if(situacaoDoLivro != 'valor2')
  {
   if (parseInt(arryLivros[index].numeroDePaginasLivro,10) != 0) {
    let numeropaginas = arrayDeResposta.data.volumeInfo.pageCount
    //let description =  arrayDeResposta.data.volumeInfo.description
  //  = parseInt(arryLivros[index].numeroDePaginasLivro,10)
   porcentagem =  ((numerolido * 100)/numeropaginas).toFixed(1)
   }
   else{
    porcentagem = 0
   }
  }
  else
  {
    porcentagem = 100
  }
   let img = arryLivros[index].img
   let situacaoModificada;
   switch (situacaoDoLivro) {
    case 'valor1':
      situacaoModificada = 'Lendo'
      break;
    case 'valor2':
        situacaoModificada = 'Lido'
        break;
    case 'valor3':
          situacaoModificada = 'Quero Ler'
          break;
    default:
          situacaoModificada = 'Erro'
      break;
   }

   // porcentagem
    arrayParaSerLido[index] = {nome:arrayDeResposta.data.volumeInfo.title,porcentagem:porcentagem,situacao:situacaoModificada,img:img};
    
  }
  console.log(arrayParaSerLido)
  //console.log(arrayDeResposta.data)


  res.render(__dirname+"/views/MinhaLeitura.ejs",{NomeDoUsuario:objetodousuario[0].name,infolivro:arrayParaSerLido,usuarioID:valordoid})
});



router.get('/DashBord/:id/AlterarUsuario', async(req, res, next) => {
  let valordoid = req.params.id
  objetodousuario =  await UserModel.find({_id:valordoid})
  console.log(objetodousuario)
 let email = objetodousuario[0].email
 let nome = objetodousuario[0].name
  res.render(__dirname+'/views/AlterarUsuario.ejs',{Nome:nome,Email:email})
});


router.post('/DashBord/:id/AlterarUsuario', async(req, res, next) => {
  let valordoid = req.params.id
  objetodousuario =  await UserModel.find({_id:valordoid})
  console.log(objetodousuario)

 let email = objetodousuario[0].email
 let nome = objetodousuario[0].name
 let livros = objetodousuario[0].livros
 let objetoAlterado ={_id:objetodousuario[0]._id,email:email,senha:req.body.userSenha,name:nome,livros:livros}
console.log(objetoAlterado)
 await UserModel.findOneAndUpdate({_id: valordoid },objetoAlterado, {
  new: true // retorna o novo objeto
})
      res.redirect(`/DashBord/${valordoid}`)
});



router.get('/DashBord/:id/AdicionarRotina', async(req, res, next) => {
  let valordoid = req.params.id
  objetodousuario =  await UserModel.find({_id:valordoid})
  let email = objetodousuario[0].email
  let nome = objetodousuario[0].name
  let livros = objetodousuario[0].livros
  //console.log(livros)
  //array dos nomes dos livros
  let arraydosnomesdoslivros = []
  for (let index = 0; index < livros.length; index++) {
    let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${livros[index].idLivro}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
    let arrayDeResposta = await axios.get(pegando_livro_pelo_id);
    console.log(arrayDeResposta)
    arraydosnomesdoslivros[index] = arrayDeResposta.data.volumeInfo.title
  }
  res.render(__dirname+'/views/adicionarRotina.ejs',{infolivro:arraydosnomesdoslivros})
});


router.post('/DashBord/:id/AdicionarRotina', async(req, res, next) => {
  let valordoid = req.params.id
  objetodousuario =  await UserModel.find({_id:valordoid})
  let log = objetodousuario[0].log

  let apigoogleBook = `https://www.googleapis.com/books/v1/volumes?q=${req.body.select}&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  let arrayDeResposta = await axios.get(apigoogleBook);
  let iddoLivro = arrayDeResposta.data.items[0].id

  let objetodelog ={iddoLivro:iddoLivro,livro:req.body.select,data:req.body.data,paginas:req.body.paginas}
  log.push(objetodelog)

  await UserModel.findOneAndUpdate({
    _id: valordoid
    }, {
        $set: {
            log: log,
          }
    }, {
        new: true // retorna o novo objeto
    })
    res.redirect(`/DashBord/${valordoid}`)
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

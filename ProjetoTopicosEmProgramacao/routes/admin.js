require('dotenv').config()

const express = require('express'),
    router = express(),
    Loaders = require('../startdb.js'),
    UserModel = require('../Models/userModel.js'),
    path = require('path'),
    bcrypt = require('bcrypt'),
    axios = require('axios'),
    paypal = require('@paypal/checkout-server-sdk');

const saltRounds = 10

router.set('view engine','ejs')
router.use('/public', express.static(path.resolve(__dirname, 'public')));
router.use(express.json())

const Enviroment = process.env.NODE_ENV === "production"?
  paypal.core.LiveEnvironment:
  paypal.core.SandboxEnvironment;
   
const paypalClient = new paypal.core.PayPalHttpClient(new Enviroment(
  process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET))

  const assinaturas = new Map([
    [1, { preco: 25, nome: "Assinatura Reading" }],
  ])

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
    const user = await UserModel.findOne({email: req.body.userText})
    console.log(user)
    if (user) {
        const cmp = await bcrypt.compare(req.body.senhaText, user.senha);
        if (cmp) {
            console.log('successful login')
            console.log(user.tipo)
            if(('tipo' in user) && user.tipo !== "Pagante"){
              return res.redirect(`/${user._id.toString()}/payment`)
            }else{
              return res.redirect(`DashBord/${user._id.toString()}`) 
            }
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
    const user = await UserModel.findOne({email: req.body.userEmail})
    if (user) {
        console.log('existing email')
        return res.redirect('/NovoUsuario')
    }
    //hash the password
    const hashedPwd = await bcrypt.hash(req.body.userSenha, saltRounds)

    const newUser = await UserModel.create({
        email: req.body.userEmail,
        senha: hashedPwd,
        name: req.body.userNome,
        statusPag:false,
    })

    res.redirect(`/${newUser._id.toString()}/payment`);
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

  
   
  let imagem_ultimo_Livro = 'https://www.imagensempng.com.br/wp-content/uploads/2021/02/Ponto-Interrogacao-Png-1024x1024.png'
  let nomeUltimoLivro = 'Sem Atividade'
  let situacaoModificada = 'Sem Atividade'
  let porcentagem = 'Sem Atividade'
  let log = []


  // Ultimo livro
  try{
  let index_ultimo_log = objetodousuario[0].log.length - 1;
  let id_do_ultimo_livro = objetodousuario[0].log[index_ultimo_log].iddoLivro;
  let index_do_ultimo_livro;

  for (let index = 0; index < objetodousuario[0].livros.length; index++) {

            if (objetodousuario[0].livros[index].idLivro == id_do_ultimo_livro) {
              index_do_ultimo_livro = index
            }
    
  }

  

  //nome ultimo livro
  let nomeUltimoLivro = objetodousuario[0].log[index_ultimo_log].livro

  //situacao do ultimo livro
  let situacaoModificada;

  switch (objetodousuario[0].livros[index_do_ultimo_livro].situacaoDoLivro) {
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

  // imagem ultimo livro
   
   imagem_ultimo_Livro = objetodousuario[0].livros[index_do_ultimo_livro].img
  
  // porcentagem ultimo livro
          let numerodepags = 0;
          for (let index = 0; index < objetodousuario[0].log.length; index++) {
            console.log(id_do_ultimo_livro)
            console.log(objetodousuario[0].log[index].iddoLivro)

              if(id_do_ultimo_livro == objetodousuario[0].log[index].iddoLivro)
              {
                numerodepags += parseInt(objetodousuario[0].log[index].paginas,10)
              }
            
          }
          //console.log(numerodepags)




          let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${id_do_ultimo_livro}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
          let arrayDeResposta = await axios.get(pegando_livro_pelo_id);
        // console.log(arrayDeResposta)
        //arryLiarrayDeRespostavros
        
        if(situacaoModificada != 'valor2')
        {
        if (numerodepags != 0) {
          let numeropaginas = arrayDeResposta.data.volumeInfo.pageCount
          //let description =  arrayDeResposta.data.volumeInfo.description
        //  = parseInt(arryLivros[index].numeroDePaginasLivro,10)
        porcentagem =  ((numerodepags * 100)/numeropaginas).toFixed(1)
        }
        else{
          porcentagem = 0
        }
        }
        else
        {
          porcentagem = 100
        }

        let log = objetodousuario[0].log;
        console.log(log)
      }catch(error){
       
      }
  res.render(__dirname+'/views/DashBord.ejs',{NomeDoUsuario:objetodousuario[0].name,quantidadedepaginas:quantidadedepaginas,quantidadedelivros:quantidadedeLivros,usuarioID:valordoid,imgUltimoLivro:imagem_ultimo_Livro,NomeDoUltimoLivro:nomeUltimoLivro,StatusDoUltimoLivro:situacaoModificada,PorcentagemUltimoLivro:porcentagem,Log:log})
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
//   let teste;res.render
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
  console.log(arrayDeResposta.data.volumeInfo.title)



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
  console.log(valorDaPosicao)
  objetodousuario =  await UserModel.find({_id:valordoid})
  console.log(objetodousuario[0].livros[valorDaPosicao])
  let livro = objetodousuario[0].livros[valorDaPosicao]

  let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${livro.idLivro}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  let arrayDeResposta = await axios.get(pegando_livro_pelo_id);

  let nomeDoLivro = arrayDeResposta.data.volumeInfo.title

  
  
  res.render(__dirname+"/views/AlterarLivro.ejs",{NomeDoUsuario:objetodousuario[0].name,NomeDoLivro:nomeDoLivro})
});


router.post('/DashBord/:id/AlterarLivro/:posicaodolivro', async(req, res, next) => {
  //alteracao a partir da posicao do array
  //0
  let valordoid = req.params.id
  let valorDaPosicao = req.params.posicaodolivro;

  let objetodousuario =  await UserModel.find({_id:valordoid})
  console.log(objetodousuario[0].livros[valorDaPosicao])
  let livro = objetodousuario[0].livros[valorDaPosicao]
  //pegando os valores att do livro
  //id: eu tenho o nome do livro colocado 
 // let nomedoLivro = req.body.userNomeDoLivro;
 let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${objetodousuario[0].livros[valorDaPosicao].idLivro}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
 let arrayDeResposta = await axios.get(pegando_livro_pelo_id);
 console.log(arrayDeResposta.data)
  let iddoLivro = arrayDeResposta.data.id
  //console.log(arrayDeResposta.data.items[0])
  let imagemdolivro
 // console.log(arrayDeResposta.data.items[0].volumeInfo)
  if(arrayDeResposta.data.volumeInfo.imageLinks == undefined)
  {
    imagemdolivro = null
  }
  else
  {
    imagemdolivro= arrayDeResposta.data.volumeInfo.imageLinks.thumbnail
  }

  let livroatt = {idLivro:iddoLivro,situacaoDoLivro:req.body.select,img:imagemdolivro}

  objetodousuario =  await UserModel.find({_id:valordoid})
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


 
  

  //pegando o nome do livro com base no id



  // for (let index = 0; index < objetodousuario[0].log.length; index++) {
  //   console.log(objetodousuario[0].log[index].iddoLivro)
  //   console.log(objetodousuario[0].livros[indexDoLivro].idLivro)
  
  //      if(objetodousuario[0].log[index].iddoLivro == objetodousuario[0].livros[indexDoLivro].idLivro)
  //      {
  //       console.log(objetodousuario[0].log[index].paginas)
  //       numerodepaginaslida += objetodousuario[0].log[index].paginas
  //      }
  //   }

  for (let index = 0; index < arryLivros.length; index++) {

    let numerolido = 0;

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


router.get('/DashBord/:id/MeuLivro/:index', async(req, res, next) => {
  let valordoid = req.params.id
  let indexDoLivro = req.params.index
  objetodousuario =  await UserModel.find({_id:valordoid})
  //console.log(objetodousuario)
 let nome = objetodousuario[0].name

 // nome do livro
 let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${objetodousuario[0].livros[indexDoLivro].idLivro}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
 let arrayDeResposta = await axios.get(pegando_livro_pelo_id);
 let nomeDoLivro = arrayDeResposta.data.volumeInfo.title
 let numerodepaginaslida = 0;
// quantidade de paginas lidas
 for (let index = 0; index < objetodousuario[0].log.length; index++) {
  console.log(objetodousuario[0].log[index].iddoLivro)
  console.log(objetodousuario[0].livros[indexDoLivro].idLivro)

     if(objetodousuario[0].log[index].iddoLivro == objetodousuario[0].livros[indexDoLivro].idLivro)
     {
      console.log(objetodousuario[0].log[index].paginas)
      numerodepaginaslida += objetodousuario[0].log[index].paginas
     }
  }

  let situacaoModificada ;
   switch (objetodousuario[0].livros[indexDoLivro].situacaoDoLivro) {
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
 let numero_de_paginas = parseInt(numerodepaginaslida,10);
 console.log(indexDoLivro)

  res.render(__dirname+'/views/MeuLivro.ejs',{usuarioID:valordoid,NomeDoUsuario:nome,img:objetodousuario[0].livros[indexDoLivro].img,NomeDoLivro:nomeDoLivro,Situacao:situacaoModificada,Paginas:numero_de_paginas,livroId:objetodousuario[0].livros[indexDoLivro].idLivro,indexDoLivro:indexDoLivro})
});



router.get('/DashBord/:id/AlterarUsuario/', async(req, res, next) => {
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



router.get('/DashBord/:id/AdicionarRotina/:idDoLivro', async(req, res, next) => {
   let valordoid = req.params.id
   let iddolivro = req.params.idDoLivro
   objetodousuario =  await UserModel.find({_id:valordoid})
  // let email = objetodousuario[0].email
   let nome = objetodousuario[0].name
   let nomenomedoLivro = ""
  // let livros = objetodousuario[0].livros
  // //console.log(livros)
  // //array dos nomes dos livros
  // let arraydosnomesdoslivros = []
  // for (let index = 0; index < livros.length; index++) {
     let pegando_livro_pelo_id = `https://www.googleapis.com/books/v1/volumes/${iddolivro}?key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
     let arrayDeResposta = await axios.get(pegando_livro_pelo_id);
     console.log('')
      nomedoLivro = arrayDeResposta.data.volumeInfo.title
  // }
   res.render(__dirname+'/views/adicionarRotina.ejs',{NomeDoLivro:nomedoLivro,NomeDoUsuario:nome,usuarioID:valordoid})
});


router.post('/DashBord/:id/AdicionarRotina/:idDoLivro', async(req, res, next) => {
   let valordoid = req.params.id
   let iddoLivro = req.params.idDoLivro
   objetodousuario =  await UserModel.find({_id:valordoid})
   let log = objetodousuario[0].log

  let apigoogleBook = `https://www.googleapis.com/books/v1/volumes?q=${iddoLivro}&key=AIzaSyB0tE_alkPXEnuRdhd3PtaUwiFFEISIsSI`
  let arrayDeResposta = await axios.get(apigoogleBook);
  console.log(arrayDeResposta.data.items[0].volumeInfo.title)
  let nome = arrayDeResposta.data.items[0].volumeInfo.title

   let objetodelog ={iddoLivro:iddoLivro,livro:nome,data:req.body.data ,paginas:req.body.paginas}
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

  router.get('/:id/payment',async(req, res, next) =>{
    res.render(__dirname + '/views/payment.ejs', {clientID: process.env.PAYPAL_CLIENT_ID,userID: req.params.id});
  })

  router.post("/:id/payment", async (req, res) => {
    const valorID = req.params.id
    const request = new paypal.orders.OrdersCreateRequest()
    const total = req.body.items.reduce((sum, item) => {
      return sum + assinaturas.get(item.id).preco * item.quantity
    }, 0)
    request.prefer("return=representation")
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "BRL",
            value: total,
            breakdown: {
              item_total: {
                currency_code: "BRL",
                value: total,
              },
            },
          },
          items: req.body.items.map(item => {
            const assinatura = assinaturas.get(item.id)
            return {
              name: assinatura.nome,
              unit_amount: {
                currency_code: "BRL",
                value: assinatura.preco,
              },
              quantity: item.quantity,
            }
          }),
        },
      ],
    })
    try {
      const order = await paypalClient.execute(request)
      console.log(`order ${order.result.id}`);
      res.json({ id: order.result.id })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  router.get('/payment/:id/capture', async(req,res) =>{
      //Atualiza status
      await UserModel.findOneAndUpdate({id: req.params.id},{tipo: "Pagante"})
      res.redirect(`/DashBord/${req.params.id}`);
  })


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

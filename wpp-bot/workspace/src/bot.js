const wppconnect = require('@wppconnect-team/wppconnect');
const firebasedb = require('../database/firebase.js');

var userStages = [];

//conexao com o wpp:
wppconnect.create({
    session: 'whatsbot',
    autoClose: false,
    puppeteerOptions: { args: ['--no-sandbox'] }
})
    .then((client) =>
    
        client.onMessage((message) => {
            if(message.isGroupMsg === false) { //faz com que o bot ignore mensagens de grupos
                console.log('Mensagem digitada pelo Usuário: ' + message.body);
                queryUserByPhone(client, message);
                }
            }))
    .catch((error) =>
        console.log(error));

//estagios do chat
function stages(client, message) {
    stage = userStages[message.from];
    switch  (stage) {
        case 'Name':
            const name = message.body;
            sendWppMessage(client, message.from, 'Obrigada ' + name);
            sendWppMessage(client, message.from, 'Agora, por gentileza, pode deixar em uma mensagem o que deseja, sr(a) ' + name);
            userStages[message.from] = 'Text';
            break;
        case 'Text':
            const text = message.body;
            sendWppMessage(client, message.from, 'Mensagem recebida, logo mais a Karine Ennalian lhe retornará');
            userStages[message.from] = 'Bye'
            break;
        case 'Bye': //mensagem de despedida
            const byebye = message.body;
            sendWppMessage(client, message.from, 'Até logo! Tenha um ótimo dia ;)');
            break;
        default: //mmensagem de boas vindas
            console.log('*Usuário atual* from: ' + message.from);
            saveUser(message);
            sendWppMessage(client, message.from, 'Olá, me chamo Betim, sou um robô assistente, a Karine Ennalian está indisponível no momento.');
            sendWppMessage(client, message.from, 'Mas poderia me informar seu nome para guardamos sua mensagem e ela responderar logo mais :)');
            userStages[message.from] = 'Name';
    }
}

//salvar novos usuarios no banco de dados
async function saveUser(message) {
    let user = {
        'pushname': (message['sender']['pushname'] != undefined) ? message['sender']['pushname'] : '',
        'whatsapp': (message.from).replace(/[^\d]+/g, '')
    }
    let newUser = firebasedb.saveUserDB(user);
    return newUser;
}

//busca de usuario já cadastrados no banco de dados
async function queryUserByPhone(client, message) {
    let phone = (message.from).replace(/[^\d]+/g, '');
    let userData = await firebasedb.queryByPhone(phone);
    if(userData == null){
        userData = await saveUser(message); //cadastrar o usuario que não foi achado dentro dos parametros
    }
    console.log('Usuario achado: ' + userData['id']);
    stages(client, message, userData);
}

//envio e recebimento de mensagens
function sendWppMessage(client, sendTo, text){
    client.sendText(sendTo, text)
        .then((result) => {
            console.log('As mensagens foram enviadas e recebidas com sucesso: ', result);
        })
        .catch((error) => {
            console.erro('Erro: ', error);
        });
}
const firebaseadmin = require('firebase-admin');

//conexao com o banco
const firebaseServiceAccount = require('./whatsappbot-b21d3-firebase-adminsdk-24vyj-d0a5d68ac2.json');

firebaseadmin.initializeApp({
    credential: firebaseadmin.credential.cert(firebaseServiceAccount)
});
const db = firebaseadmin.firestore();

exports.saveUserDB = async function (user) {
    user['date'] = firebaseadmin.firestore.Timestamp.fromDate(new Date());
    let newRegister = await db.collection('users').add(user);
    user['id'] = newRegister.id;
    return user;
};

exports.queryByPhone = async function (phone) {
    let userData = null;
    try {
        const queryRef = await db.collection('users')
            .where('whatsapp', '==', phone)
            .get();
        if (!queryRef.empty){
            queryRef.forEach((user) => {
                userData = user.data();
                userData['id'] = user.id;
            });
        }
    } catch (_error) {
        console.log(_error);
    };
    return userData;
};
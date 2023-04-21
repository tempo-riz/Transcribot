const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, child, get, onValue } = require("firebase/database");

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "discord-voice-message-to-text.firebaseapp.com",
    projectId: "discord-voice-message-to-text",
    storageBucket: "discord-voice-message-to-text.appspot.com",
    messagingSenderId: "14465129210",
    appId: "1:14465129210:web:b90a621317e360e3ee0743",
    databaseURL: "https://discord-voice-message-to-text-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// console.log(database)
const db = getDatabase(app);

console.log("Firebase Ready");


function saveMessage(message) {
    set(ref(db, 'messages/' + message.ids.messageId), message);
}

function saveAllServerSettings(settings) {
    settings.forEach((value, key) => {
        set(ref(db, 'servers/' + key), value);
    });
}

async function loadAllServerSettings() {
    return new Promise((resolve) => {
        onValue(ref(db, 'servers/'), (snapshot) => {
            const data = snapshot.val();
            const map = new Map(Object.entries(data));
            resolve(map);
        });
    });
}

function updateServerSettings(serverId, settings) {
    set(ref(db, 'servers/' + serverId), settings.get(serverId));
}

module.exports = {
    saveMessage,
    saveAllServerSettings,
    loadAllServerSettings,
    updateServerSettings
}
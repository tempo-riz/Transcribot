const { Deepgram } = require('@deepgram/sdk');


// Initializes the Deepgram SDK
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);
console.log("Deepgram Ready");

async function transcript(attachment,language) {
    
    const default_error = "wtf are you saying ?";
    return new Promise((resolve) => {
        deepgram.transcription.preRecorded(
            { url: attachment.url },
            { punctuate: true, model: 'enhanced', language: language },
        ).then((transcription) => {
            const text = transcription.results?.channels[0]?.alternatives[0]?.transcript || default_error;
            resolve(text);
        }).catch((err) => {
            console.log(err);
            resolve(default_error);
        })
    });
}

module.exports = {
    transcript
}
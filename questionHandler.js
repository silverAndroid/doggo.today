const fs = require('fs');
const DogModel = require('./models/Dog')
const Dog = new DogModel().createModel()
const breeds = JSON.parse(fs.readFileSync('./dog-breeds.json')).map(breed => capitalize(breed));
const userMap = new Map();
const messengerBot = require('facebook-messenger-bot');

const QuestionTypes = {
    SINGLE: 0,
    RANDOM: 1,
};
const questions = [
    {
        question: 'What dog breed do you like?',
        answers: breeds,
        type: QuestionTypes.RANDOM,
        maximum: 3,
    },
    {
        question: 'How old would you like your dog to be?',
        answers: [
            'Puppy',
            'Adult',
            'Elderly',
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: 'What size dog would you like?',
        answers: [
            'Small',
            'Medium',
            'Large'
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: 'What kind of dog are you looking for?',
        answers: [
            'Playful',
            'Loves being outdoors',
            'Fluffy'
        ]
    }
];

module.exports.onMessageReceived = (message, userID) => new Promise((resolve, reject) => {
    getQuestion(message, userID, resolve);
});

function getQuestion(message, userID, resolve) {
    let questionNumber = 0;
    if (userMap.has(userID)) {
        questionNumber = userMap.get(userID);
        if (questions[questionNumber].answers.some(answer => message === answer)) {
            questionNumber += 1;
        }
    } else {
        userMap.set(userID, 0);
    }

    if (questionNumber < questions.length) {
        const question = questions[questionNumber];
        if (question.type === QuestionTypes.RANDOM) {
            question.answers = reduceArray(question.answers, question.maximum);
        }

        userMap.set(userID, questionNumber);
        resolve(question);
    } else {
        resolve({
            elements: returnPotentialDoggos(userID),
        });
    }
}

const returnPotentialDoggos = (userID) => {

    // await Dog.register("fbid", "Dog 1", "breed", "age", "size", "personality", "AVAILABLE")
    // await Dog.register("fbid", "Dog 2", "breed", "age", "size", "personality", "AVAILABLE")
    // //if doggos found
    // potentialDoggos = await Dog.findAvailableDoggos()


    const out = new messengerBot.Elements();

    const potentialDoggos = [{
        external_id: "fbid", 
        name: "Dog 1", 
        breed: "doggo bread", 
        age: "puppy", 
        size: "small", 
        personality: "fluffy", 
        availability: "AVAILABLE"
    }, {
        external_id: "fbid", 
        name: "Dog 2", 
        breed: "doggo bread", 
        age: "puppy", 
        size: "small", 
        personality: "fluffy", 
        availability: "AVAILABLE"
    }];

    // console.log(potentialDoggos)
    for (let {name} of potentialDoggos){
         out.add({text: name, image: "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/00100dPORTRAIT_00100_BURST20170914121422905_C.width-1000.jpg"});
    }
    // console.log(out)
    console.log(out)
    return out
    //if no doggos found
    // resolve({question: 'Thank you for answering all of our questions! We\'ll contact you soon if we have a dog for you.'});
}

function reduceArray(array, maximum) {
    return shuffle(array).slice(0, maximum);
}

function shuffle(arr) {
    let clone = [...arr];

    for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = clone[i];
        clone[i] = clone[j];
        clone[j] = tmp;
    }

    return clone;
}

function capitalize(string) {
    return string.slice(0, 1).toUpperCase() + string.slice(1);
}
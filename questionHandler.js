const fs = require('fs');

const userMap = new Map();
const breeds = JSON.parse(fs.readFileSync('./dog-breeds.json')).map(breed => capitalize(breed));
const END_OF_QUESTIONS_STR = 'Thank you for answering all of our questions! We\'ll contact you soon if we have a dog for you.';
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
        ],
        type: QuestionTypes.SINGLE,
    }
];

module.exports.onMessageReceived = (message, userID) => new Promise((resolve) => {
    // Get user if exists in user map
    let user = getUser(userID);
    // Increment question if answer is a given one
    user = verifyAnswer(message, user);
    sendQuestion(user, resolve);
});

function getUser(userID) {
    let user = {answers: [], question: 0, id: userID};
    if (userMap.has(userID)) {
        user = userMap.get(userID);
    }
    return user;
}

function verifyAnswer(message, user) {
    message = message.toLowerCase();
    if (questions[user.question].answers.some(answer => answer.toLowerCase() === message)) {
        user.question += 1;
        user.answers.push(message);
    }
    return user;
}

function sendQuestion(user, resolve) {
    // Check if new question is past the limit
    const questionNumber = user.question;
    if (questionNumber < questions.length) {
        const question = questions[questionNumber];
        if (question.type === QuestionTypes.RANDOM) {
            question.answers = reduceArray(question.answers, question.maximum);
        }

        userMap.set(user.id, user);
        resolve(question);
    } else {
        resolve({question: END_OF_QUESTIONS_STR});
    }
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
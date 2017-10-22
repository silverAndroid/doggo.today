const fs = require('fs');

const userMap = new Map();
const breeds = JSON.parse(fs.readFileSync('./dog-breeds.json')).map(breed => capitalize(breed));
const messengerBot = require('facebook-messenger-bot');
const END_OF_ADOPTING_STR = 'Thank you for answering all of our questions! I\'ll contact you soon if I have a dog for you.';
const END_OF_GIVING_STR = 'Thank you for answering all of our questions! I\'ll contact you soon if someone is interested in taking your dog. Please keep in mind that potential adopters will be able to see your dog\'s profile.';
const RESTART_STR = 'I noticed you entered a new message. Did you want to fill out another application?';

const QuestionTypes = {
    SINGLE: 0,
    RANDOM: 1,
    INPUT: 2,
    PICTURE: 3,
};
const initialQuestion = {
    question: 'Are you putting your dog up for adoption or adopting a dog?',
    answers: [
        // TODO: Pick phrase that doesn't get cut off
        'Dog for adoption',
        'Adopting a dog'
    ],
    type: QuestionTypes.SINGLE,
};
const givingAwayQuestions = [
    {
        question: 'I have 6 questions for you. \n1) What breed is your dog?',
        type: QuestionTypes.INPUT,
    },
    {
        question: '2) Is your dog a puppy, an adult, or is he/she elderly?',
        type: QuestionTypes.SINGLE,
        answers: [
            'Puppy',
            'Adult',
            'Elderly',
        ],
    },
    {
        question: '3) Do you have a small or large dog?',
        answers: [
            'Small',
            'Large',
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: '4) How would you describe your dog? (Independent, active)',
        type: QuestionTypes.INPUT,
    },
    {
        question: '5) Please upload a picture of your dog.',
        type: QuestionTypes.PICTURE,
    },
    {
        question: '6) And before I forget! What\'s the name of your dog?',
        type: QuestionTypes.INPUT,
    },
];
const adoptingQuestions = [
    {
        question: 'I have 4 questions for you. \n1) What dog breed do you like?',
        type: QuestionTypes.INPUT,
    },
    {
        question: '2) How old would you like your dog to be?',
        answers: [
            'Puppy',
            'Adult',
            'Elderly',
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: '3) Would you like a small dog or a large dog?',
        answers: [
            'Small',
            'Large'
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: '4) What kind of dog are you looking for?',
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

module.exports.onImagesReceived = (images, userID) => new Promise((resolve) => {
    let user = getUser(userID);
    user = verifyImages(images, user);
    sendQuestion(user, resolve);
});

function getUser(userID) {
    let user = {answers: [], question: 0, id: userID, restart: false};
    if (userMap.has(userID)) {
        user = userMap.get(userID);
    }
    return user;
}

function verifyAnswer(message, user) {
    message = message.toLowerCase();
    if (!user.questions) {
        if (message === initialQuestion.answers[0].toLowerCase()) {
            user.questions = givingAwayQuestions;
        } else if (message === initialQuestion.answers[1].toLowerCase()) {
            user.questions = adoptingQuestions;
        }
    } else {
        const question = user.questions[user.question];
        if (user.question < user.questions.length) {
            if (question.type === QuestionTypes.INPUT) {
                user.question += 1;
                user.answers.push({text: message});
            } else if (question.type === QuestionTypes.SINGLE || question.type === QuestionTypes.RANDOM) {
                if (user.questions[user.question].answers.some(answer => answer.toLowerCase() === message)) {
                    user.question += 1;
                    user.answers.push({text: message});
                }
            }
        }
    }

    return user;
}

function verifyImages(images, user) {
    if (!!user.questions) {
        const question = user.questions[user.question];
        if (question.type === QuestionTypes.PICTURE) {
            user.question += 1;
            // user.answers.push({images}); // images is a url
            user.answers.push({images: ['https://i.ytimg.com/vi/SfLV8hD7zX4/maxresdefault.jpg']});
        }
    }

    return user;
}

function sendQuestion(user, resolve) {
    // Check if new question is past the limit
    const questionNumber = user.question;
    const question = !user.questions ? initialQuestion : user.questions[questionNumber];
    if (!user.questions) {
        resolve(question);
    } else {
        if (questionNumber < user.questions.length) {
            if (question.type === QuestionTypes.RANDOM) {
                question.answers = reduceArray(question.answers, question.maximum);
            }
            console.log(questionNumber, question);

            userMap.set(user.id, user);
            resolve(question);
        } else {
            // user.restart = true;
            const isAdopting = user.questions === adoptingQuestions;
            if (isAdopting) {
                const doggos = getPotentialDoggos(user);
                if (/*!user.restart && */doggos.length > 0) {
                    return resolve({elements: doggos});
                }
            }
            const sentence = /*user.restart ? RESTART_STR :*/ (isAdopting ? END_OF_ADOPTING_STR : END_OF_GIVING_STR);
            resolve({question: sentence});
        } // TODO: Add option to restart from beginning
    }
}

const getPotentialDoggos = (matchingUser) => {

    // await Dog.register("fbid", "Dog 1", "breed", "age", "size", "personality", "AVAILABLE")
    // await Dog.register("fbid", "Dog 2", "breed", "age", "size", "personality", "AVAILABLE")
    // //if doggos found
    // potentialDoggos = await Dog.findAvailableDoggos()


    const out = new messengerBot.Elements();
    const potentialDoggos = getMatchings(matchingUser);

    for (let {id} of potentialDoggos) {
        console.log("id: " + id);
        const user = userMap.get(id);
        console.log("user: ")
        console.log(user)
        out.add({
            text: user.answers[5].text,
            subtext: user.answers[3].text,
            image: user.answers[4].images[0],
        });
    }
    console.dir(out);
    return out;
};

function getMatchings(matchingUser) {
    const scores = [];
    for (let [id, user] of userMap) {
        if (matchingUser.id === id || user.answers.length != 6) {
            continue;
        }

        const length = user.answers.length > matchingUser.answers.length ? matchingUser.answers.length : user.answers.length;
        let score = 0;
        for (let i = 0; i < length; i++) {
            if (matchingUser.answers[i] === user.answers[i]) {
                score += 1;
            }
        }
        scores.push({id, score});
    }

    scores.sort((a, b) => b.score - a.score);
    matchingUser.scores = scores;
    return scores;
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
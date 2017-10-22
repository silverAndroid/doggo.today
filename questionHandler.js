const fs = require('fs');

const userMap = new Map();
const breeds = JSON.parse(fs.readFileSync('./dog-breeds.json')).map(breed => capitalize(breed));
const messengerBot = require('facebook-messenger-bot');
const END_OF_ADOPTING_STR = 'Thank you for answering all of our questions! I\'ll contact you soon if I have a doggo for you.';
const END_OF_GIVING_STR = 'Thank you for answering all of our questions! I\'ll contact you soon if someone is interested in taking your doggo. Please keep in mind that potential adopters will be able to see your doggo\'s profile.';
const RESTART_STR = 'I noticed you entered a new message. Did you want to fill out another application?';

const QuestionTypes = {
    SINGLE: 0,
    RANDOM: 1,
    INPUT: 2,
    PICTURE: 3,
    LOCATION: 4,
};
const Pages = {
    DESCRIPTION: 3,
    LOCATION: 4,
    IMAGE: 5,
    DOG_NAME: 6,
};
const initialQuestion = {
    question: 'Are you putting your doggo up for adoption or adopting a doggo?',
    answers: [
        // TODO: Pick phrase that doesn't get cut off
        'Doggo for adoption',
        'Adopting a doggo'
    ],
    type: QuestionTypes.SINGLE,
};
const givingAwayQuestions = [
    {
        question: 'I have 7 questions for you. \n1) What breed is your doggo?',
        type: QuestionTypes.INPUT,
    },
    {
        question: '2) Is your doggo a puppy, an adult, or is he/she elderly?',
        type: QuestionTypes.SINGLE,
        answers: [
            'Puppy',
            'Adult',
            'Elderly',
        ],
    },
    {
        question: '3) Do you have a small or large doggo?',
        answers: [
            'Small',
            'Large',
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: '4) How would you describe your doggo? (Independent, active)',
        type: QuestionTypes.INPUT,
    },
    {
        question: '5) Where does the doggo live?',
        type: QuestionTypes.LOCATION,
    },
    {
        question: '6) Please upload a picture of your doggo.',
        type: QuestionTypes.PICTURE,
    },
    {
        question: '7) And before I forget! What\'s the name of your doggo?',
        type: QuestionTypes.INPUT,
    },
];
const adoptingQuestions = [
    {
        question: 'I have 6 questions for you. \n1) What doggo breed do you like?',
        type: QuestionTypes.INPUT,
    },
    {
        question: '2) How old would you like your doggo to be?',
        answers: [
            'Puppy',
            'Adult',
            'Elderly',
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: '3) Would you like a small doggo or a large doggo?',
        answers: [
            'Small',
            'Large'
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: '4) What kind of doggo are you looking for?',
        answers: [
            'Playful',
            'Loves being outdoors',
            'Fluffy'
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: '5) Where do you live?',
        type: QuestionTypes.LOCATION,
    },
    {
        question: '6) What is the radius you are willing to travel for your new doggo?',
        type: QuestionTypes.INPUT,
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

module.exports.onLocationReceived = (location, userID) => new Promise((resolve) => {
    let user = getUser(userID);
    user = verifyLocation(location, user);
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
            user.isAdopting = false;
            user.questions = givingAwayQuestions;
        } else if (message === initialQuestion.answers[1].toLowerCase()) {
            user.isAdopting = true;
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
            user.answers.push({images}); // images is an array of images
        }
    }

    return user;
}

function verifyLocation({lat, long}, user) {
    if (!!user.questions) {
        const question = user.questions[user.question];
        if (question.type === QuestionTypes.LOCATION) {
            user.question += 1;
            user.answers.push({lat, long});
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
            } else if (question.type === QuestionTypes.LOCATION) {
                userMap.set(user.id, user);
                return openLocationPrompt(user, resolve);
            }
            console.log(questionNumber, question);

            userMap.set(user.id, user);
            resolve(question);
        } else {
            // user.restart = true;
            const isAdopting = user.isAdopting;
            const doggos = getPotentialDoggosUI(user);
            if (/*!user.restart && */doggos.ids.length !== 0) {
                return resolve({elements: doggos});
            }
            const sentence = /*user.restart ? RESTART_STR :*/ (isAdopting ? END_OF_ADOPTING_STR : END_OF_GIVING_STR);
            resolve({question: sentence});
        } // TODO: Add option to restart from beginning
    }
}

function convertLongLatToDistance(lat1, lat2, lon2, lon1) {
    var R = 6371e3; // metres
    var φ1 = degreeToRadians(lat1);
    var φ2 = degreeToRadians(lat2);
    var Δφ = degreeToRadians(lat2 - lat1); 
    var Δλ = degreeToRadians(lon2 - lon1); 
    
    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
}
function degreeToRadians(degree) {
    return degree * Math.PI / 180;
}

function getPotentialDoggosUI(matchingUser) {
    const out = new messengerBot.Elements();
    const potentialDoggos = getMatchings(matchingUser);
    const output = {};
    const ids = [];

    for (let {id} of potentialDoggos) {
        const user = userMap.get(id);
        const buttons = new messengerBot.Buttons();
        buttons.add({text: 'select', data: {id}});
        out.add({
            image: user.answers[Pages.IMAGE].images[0],
            text: user.answers[Pages.DOG_NAME].text,
            subtext: user.answers[Pages.DESCRIPTION].text,
            buttons
        });
        ids.push(id);
    }
    output.ui = out;
    output.ids = ids;
    return output;
}

function openLocationPrompt(user, resolve) {
    const replies = new messengerBot.QuickReplies();
    replies.add({text: 'location', isLocation: true});
    const out = new messengerBot.Elements();
    out.add({text: user.questions[Pages.LOCATION].question});
    out.setQuickReplies(replies);
    resolve({locationUI: out});
}

function getMatchings(matchingUser) {
    const scores = [];
    for (let [id, user] of userMap) {
        console.log(user.answers[Pages.LOCATION])
        let potentialDogLocation = user.answers[Pages.LOCATION];
        let userLocation = matchingUser.answers[Pages.LOCATION];
        if (matchingUser.id === id || user.isAdopting || convertLongLatToDistance(potentialDogLocation.lat, userLocation.lat, potentialDogLocation.long, userLocation.long) > Number(matchingUser.answers[5].text)) {
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
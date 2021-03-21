const topics = [
    'garden hose',
    'lighter',
    'penguin',
    'tractor',
    'sheep',
    'skateboard',
    'mountain',
    'mouse',
    'chandelier',
    'guitar',
    'roller coaster',
    'owl',
    'toilet',
    'map',
    'snail',
    'yoga',
    'spoon',
    'camera',
    'telephone',
    'bench',
    'pig',
    'lion'
];

export const getRandomTopic = (): String => {
    return topics[Math.floor(Math.random() * topics.length)];
};

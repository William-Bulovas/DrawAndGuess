const gameIdLength = 5 as const;

export const gameIdCreator = () => {
    let result: String = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < gameIdLength; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
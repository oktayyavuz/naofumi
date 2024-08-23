const badWords = [
        "oç", "amk", "ananı sikiyim", "ananıskm", "piç", "Amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "sik", "yarrak", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "amq","orospu çocuğu", "ibne", "göt", "amına koyim", "amk malı", "amına kodumun", "amına kodum", "amk çocuğu", "amına koyayım", "amına koyim", "sikik", "amk orospu çocuğu", "amına koy", "amk piçi", "amına koyayim", "orospu evladı", "amk orospusu", "amına koyim", "amk maldır", "amk mal", "amına koyarım", "amk çocuğu", "amk evladı", "amına koyduğum", "amına koyduğumun", "amk orospu çocuğu", "amına koyayımın", "amk orospusu", "sikik piç", "amk orospu", "amına koyduğumun çocuğu", "amk orospu evladı", "amk orospu çocuğu", "amk orospu evladı", "amına koyduğumun evladı",

    ];
    
    function turkishToLower(text) {
        return text.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
    }
    
    function isOffensiveWordCaseInsensitive(text) {
        const normalizedText = turkishToLower(text).replace(/\s+/g, '');
        return badWords.some(word => {
            const normalizedWord = turkishToLower(word);
            return normalizedText.includes(normalizedWord) ||
                   turkishToLower(text) === normalizedWord ||
                   text.split('').every((char, index) => 
                       turkishToLower(char) === normalizedWord[index % normalizedWord.length]
                   );
        });
    }
    
    
    module.exports = { isOffensiveWordCaseInsensitive, badWords };
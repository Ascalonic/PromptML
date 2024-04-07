const askTheAI = require('./index');

(async () => {
    const filePath = './samples/generateRandomString.prompt'; 

    try {
        const response = await askTheAI(filePath);
        console.log(response);
    } catch (error) {
        console.error("Failed to process YAML file:", error);
    }
})();
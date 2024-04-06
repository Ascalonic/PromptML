const askTheAI = require('./index');

(async () => {
    const filePath = './test1.prompt'; 

    try {
        const response = await askTheAI(filePath, { "author": "Abraham Lincoln", "numberOfQuotes": 3 });
        console.log(response);
    } catch (error) {
        console.error("Failed to process YAML file:", error);
    }
})();
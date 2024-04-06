const askTheAI = require('./index');

(async () => {
    const filePath = './test1.prompt'; 

    try {
        const response = await askTheAI(filePath);
        console.log(response);
    } catch (error) {
        console.error("Failed to process YAML file:", error);
    }
})();
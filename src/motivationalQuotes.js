const askTheAI = require('./index');

(async () => {
    const filePath = './samples/factCheck.prompt'; 

    try {
        const response = await askTheAI(filePath, { "factToCheck": "Cats can lay eggs" });
        console.log(response);
    } catch (error) {
        console.error("Failed to process YAML file:", error);
    }
})();
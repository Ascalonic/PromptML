require('dotenv').config();

const cld = require('cld');
const jsYaml = require('js-yaml');
const fs = require('fs');
const OpenAI = require('openai').default;
const openai = new OpenAI();

const OPEN_AI_MODELS = [
    "gpt-4-turbo-preview",
    "gpt-4",
    "gpt-3.5-turbo"
]

const defaultRole = 'You are a helpful assistant designed to output responses to user queries'

/**
 * Parses the prompt file, and returns the validated response from the AI model
 * @param {string} filePath - The path to the YAML file.
 * @returns {Object} The response from the LLM
 */
async function askTheAI(filePath, params = null) {
    try {
        // Load YAML file and parse it
        const fileContents = fs.readFileSync(filePath, 'utf8');

        let data = jsYaml.load(fileContents);
        let format = "any";

        // Basic validation example
        if (!data.engine || !data.prompt) {
            throw new Error('Missing required fields in the YAML file.');
        }

        // Process the inputs
        let prompt = data.prompt;
        if (data.inputs) {
            for (const input of data.inputs) {
                if (input.type === 'scalar' && input.name) {
                    const placeholder = `{{${input.name}}}`;
                    if(input.hasOwnProperty('value')) {
                        //inline
                        prompt = prompt.replace(new RegExp(placeholder, 'g'), input.value);
                    }
                    else {
                        prompt = prompt.replace(new RegExp(placeholder, 'g'), params[input.name]);
                    }
                    data.prompt = prompt;
                }
            }
        }

        let response = '';
        if (OPEN_AI_MODELS.includes(data.engine)) {
            const result = await processOpenAIPrompt(data.role ? data.role : defaultRole,
                data.prompt, data.engine);
            response = result.choices[0].message.content;
        }
        else {
            throw new Error("Unsupported model specified");
        }

        // Extract the expected response format from validations
        let expectedFormat = '';
        let requiredKeys = [];
        if (data.validations) {
            for (const validation of data.validations) {
                if (validation.type === 'format') {
                    expectedFormat = validation.expected;
                    // If there's a schema specified for JSON validation, extract required keys
                    if (expectedFormat === 'JSON' && validation.schema && validation.schema.required_keys) {
                        format = "JSON";
                        response = cleanupResponse(response);
                        requiredKeys = validation.schema.required_keys;
                        let resp = validateJSON(response, requiredKeys);
                        if (resp == null) {
                            throw new Error("The response doesn't match the validation criteria ", response);
                        }
                        response = resp;
                    }
                }
                else if (validation.type === "language") {
                    let expectedLanguage = validation.expected;
                    if (format === 'any') {
                        await validateLanguage(response, expectedLanguage);
                    }
                }
                else if (validation.type === "length") {
                    let expectedMinLength = parseInt(validation.min);
                    let expectedMaxLength = parseInt(validation.max);
                    if (response.toString().length < expectedMinLength || response.toString().length > expectedMaxLength) {
                        throw new Error("The reponse length doesn't fit the criteria");
                    }
                }
                else if (validation.type === 'response' && Array.isArray(validation.expected)) {
                    if(validation.caseSensitive) {
                        if (!validation.expected.includes(response)) {
                            throw new Error(`Response "${response}" is not in the expected list`);
                        }
                    }
                    else {
                        if (!validation.expected.map(x => x.toLowerCase()).includes(response.toLowerCase())) {
                            throw new Error(`Response "${response}" is not in the expected list`);
                        }
                    }
                }
            }
        }

        return response;
    } catch (e) {
        console.error(`Prompt error : ${e}`);
        throw e; // Rethrow or handle as needed
    }
}

async function processOpenAIPrompt(role, prompt, model) {
    console.log("prompt was " + prompt);
    const result = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: role,
            },
            { role: "user", content: prompt },
        ],
        model: model,
    });
    return result;
}

function cleanupResponse(response) {
    if (response.startsWith('```json')) {
        const result = response.match(/\{.*\}/s);
        return result ? result[0] : null;
    }
    return response;
}

function validateJSON(response, requiredKeys) {
    let jsonResponse;

    // Try parsing the response to JSON
    try {
        jsonResponse = JSON.parse(response);
    } catch (error) {
        console.error('Response is not valid JSON:', error);
        return null; // Response is not valid JSON
    }

    // Check for each required key in the parsed JSON
    const missingKeys = requiredKeys.filter(key => !(key in jsonResponse));
    if (missingKeys.length > 0) {
        console.error(`Response is missing required keys: ${missingKeys.join(', ')}`);
        return null; // Missing one or more required keys
    }

    return jsonResponse; // Response is valid JSON and contains all required keys
}

async function validateLanguage(response, language) {
    try {
        const result = await cld.detect(response);
        if(!result.languages.map(lang => lang.name.toLowerCase()).includes(language.toLowerCase())) {
            throw new Error("Language validation failed");
        }
    } catch (error) {
        console.error('Failed to validate language:', error);
        throw error; // This allows the error to be caught where validateLanguage is called
    }
}

module.exports = askTheAI;
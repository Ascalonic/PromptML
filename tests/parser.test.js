const askTheAI = require('../src/index');
jest.mock('fs');

jest.mock('openai', () => {
    return {
        default: jest.fn().mockImplementation(() => {
            return {
                chat: {
                    completions: {
                        create: jest.fn((requestOptions) => {
                            // Inspect `requestOptions` to determine the prompt
                            const prompt = requestOptions.messages.find(m => m.role === 'user').content;

                            // Determine the response based on the prompt's value
                            let mockResponse;
                            console.log(prompt);
                            switch (prompt.trim()) {
                                case 'Prompt1':
                                    mockResponse = '{ \"quote\":\"\", \"author\":\"\" }';
                                    break;
                                case 'Prompt2':
                                    mockResponse = 'Response for Prompt 2 - not a JSON';
                                    break;
                                case 'Prompt3':
                                    mockResponse = 'too short';
                                    break;
                                case 'Prompt4':
                                    mockResponse = 'Response for prompt 4';
                                    break;
                                case 'Prompt5':
                                    mockResponse = 'yes';
                                    break;
                                case 'Prompt6':
                                    mockResponse = 'random string : AHFDGD';
                                    break;
                                default:
                                    mockResponse = 'Default Mocked Response';
                                    break;
                            }

                            // Return the appropriate response
                            return Promise.resolve({
                                choices: [
                                    { message: { content: mockResponse } }
                                ]
                            });
                        })
                    }
                }
            };
        })
    };
});


describe("askTheAI function", () => {
    it("Happy case YAML is validated, recieved JSON response is validated", async () => {
        const response = await askTheAI('path1/to/valid_input.yaml');
        expect(response).toBeDefined();
    });
    it("Happy case: YAML has inputs successfully parsed and response received", async () => {
        const filePath = 'path5/to/valid_input.yaml';
        const expectedResponse = 'Response for prompt 4'; 
        const response = await askTheAI(filePath, { "promptid": "Prompt4" });
        expect(response).toEqual(expectedResponse);
    });
    it("Happy case: Sucessfully validate and extract some substring from a response using regex in non-strict mode", async () => {
        const filePath = 'path7/to/valid_input.yaml';
        const expectedResponse = 'AHFDGD'; 
        const response = await askTheAI(filePath);
        expect(response).toEqual(expectedResponse);
    });
});

describe('askTheAI error handling', () => {
    it('Unhappy case YAML is validated, recieved JSON response validation fails', async () => {
        // Assuming 'path/to/invalid_model.yaml' leads to a YAML configuration
        // that specifies an unsupported model in the `engine` field
        await expect(askTheAI('path2/to/invalid_model.yaml'))
            .rejects
            .toThrow("The response doesn't match the validation criteria ");
    });
    it('Unhappy case YAML is validated, recieved response is too short', async () => {
        // Assuming 'path/to/invalid_model.yaml' leads to a YAML configuration
        // that specifies an unsupported model in the `engine` field
        await expect(askTheAI('path3/to/invalid_model.yaml'))
            .rejects
            .toThrow("The reponse length doesn't fit the criteria");
    });
    it('Unhappy case invalid YAML', async () => {
        // Assuming 'path/to/invalid_model.yaml' leads to a YAML configuration
        // that specifies an unsupported model in the `engine` field
        await expect(askTheAI('path4/to/invalid_model.yaml'))
            .rejects
            .toThrow("Missing required fields in the YAML file.");
    });
    it('Unhappy case response doesn\'t fall into one of a list', async () => {
        // Assuming 'path/to/invalid_model.yaml' leads to a YAML configuration
        // that specifies an unsupported model in the `engine` field
        await expect(askTheAI('path6/to/invalid_model.yaml'))
            .rejects
            .toThrow("Response \"yes\" is not in the expected list");
    });
    it('Unhappy case In strict mode, the response doesn\'t fit the regex criteria', async () => {
        // Assuming 'path/to/invalid_model.yaml' leads to a YAML configuration
        // that specifies an unsupported model in the `engine` field
        await expect(askTheAI('path8/to/invalid_model.yaml'))
            .rejects
            .toThrow("Output does not match the required regex format: [A-Z]{6}");
    });
});
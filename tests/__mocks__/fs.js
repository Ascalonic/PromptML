const fs = jest.createMockFromModule('fs');

// Mock implementation of readFileSync
fs.readFileSync = jest.fn().mockImplementation((path, encoding) => {
    // Return a YAML string based on the input file path or name
    if (path.includes("path1")) {
        return `
engine: gpt-4-turbo-preview
role: You are a helpful assistant designed to output motivational quotes
prompt: Prompt1
validations:
  - type: format
    expected: JSON
    schema:
      required_keys: [quote, author]
  - type: language
    expected: English
  - type: length
    min: 10
    max: 100`;
    }
    else if (path.includes("path2")) {
        return `
engine: gpt-4-turbo-preview
role: You are a helpful assistant designed to output motivational quotes
prompt: Prompt2
validations:
  - type: format
    expected: JSON
    schema:
      required_keys: [quote, author]
  - type: language
    expected: English
  - type: length
    min: 10
    max: 100`;
    }
    else if (path.includes("path3")) {
        return `
engine: gpt-4-turbo-preview
role: You are a helpful assistant designed to output motivational quotes
prompt: Prompt3
validations:
  - type: length
    min: 10
    max: 100`;
    }
    else if (path.includes("path4")) {
        return `invalid prompt file`;
    }
    else if(path.includes("path5")) {
        return `
inputs:
  - type: scalar
    name: promptid
engine: gpt-4-turbo-preview
role: You are a helpful assistant designed to output motivational quotes
prompt: "{{promptid}}"`;
    }
    else if (path.includes("path6")) {
        return `
engine: gpt-4-turbo-preview
role: You are a helpful assistant designed to validate a fact as correct or incorrect
prompt: Prompt5
validations:
  - type: response
    expected: [ correct, incorrect ]`;
    }
});

module.exports = fs;


# PromptML

PromptML is a Node.js library designed to simplify the process of generating and validating AI prompts. It allows users to specify prompt details, validation rules, and other configurations in a YAML file, making AI interactions more structured and easier to manage.

## Installation

To use PromptML in your project, install it via npm:

`npm install promptml` 

## Usage

Here’s a quick example to get you started with PromptML. This example demonstrates how to use the library to process a YAML file containing prompt specifications.

First, ensure you have a YAML file with your prompt configuration. For example, `test.prompt`:


```yaml
metadata:
  version: 1.0
  lastUpdated: "06/04/2024"
  createdBy: "Your Name"

engine: gpt-4-turbo-preview
role: You are a helpful assistant designed to output motivational quotes
prompt: >
  Generate a motivational quote in english along with the author and output the response in
  JSON with key names quote and author
validations:
  - type: format
    expected: JSON
    schema:
      required_keys: [quote, author]
  - type: language
    expected: English
```

Then, use the following code snippet to process the YAML file:

javascript code

```javascript
const askTheAI = require('promptml');
//
//
const response = await askTheAI(filePath);

```

## Features

-   **Flexible Prompt Configuration**: Define prompts, roles, and more in an easy-to-read YAML format.
-   **Validation Rules**: Ensure outputs meet specified criteria, including format, language, and length validations.
-   **Support for Multiple AI Engines**: Configure the library to use different AI models as needed.
-   **Pass parameters into the prompt**: Pass inline or external parameters to be injected into the prompts
    ```yaml
    inputs:
      - type: scalar
        name: author
      - type: scalar
        name: numberOfQuotes

    engine: gpt-4-turbo-preview
    role: You are a helpful assistant designed to output motivational quotes
    prompt: "Generate {{numberOfQuotes}} motivational quote by {{author}}"

    ```
    ```javascript
    const response = await askTheAI(filePath, { "author": "Abraham Lincoln", "numberOfQuotes": 3 });
    ```


## Contributing

We welcome contributions! Please submit an issue or pull request on our [GitHub repository](https://chat.openai.com/c/26f47bb2-087a-4af7-8788-4a9cf4dbd195#) if you'd like to contribute.

## License

PromptML is MIT licensed.

----------

### Notes:

-   Replace placeholders (like `Your Name`, GitHub repository link, and LICENSE link) with actual data.
-   Consider adding more sections as necessary, such as **Configuration**, **Advanced Usage**, **API Reference**, and **Support**.
-   If your library has external dependencies, consider adding a section on **Requirements**.
-   Regularly update your README to reflect changes in your library's functionality and API.

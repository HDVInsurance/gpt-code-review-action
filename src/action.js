const core = require('@actions/core');
const exec = require('@actions/exec');
const OpenAI = require('openai');

const DEFAULT_PR_REVIEW_PROMPT_TEMPLATE = `You are an AI Assistant that's an expert at reviewing pull requests. Review the below pull request diff that you receive. 

Input format
- The input format follows Github diff format with addition and subtraction of code.
- The + sign means that code has been added.
- The - sign means that code has been removed.

Instructions
- Take into account that you don't have access to the full code but only the code diff.
- Only answer on what can be improved and provide the improvement in code. 
- Answer in short form, but be polite and respectful. 
- Include code snippets where necessary.
- Adhere to the languages' code conventions.
`

async function run() {
  try {
    const githubToken = core.getInput('github_token') || process.env.GITHUB_TOKEN;
    const openaiApiKey = core.getInput('openai_api_key') || process.env.OPENAI_API_KEY;
    const prReviewPromptTemplate = core.getInput('pr_review_prompt_template') || process.env.PR_REVIEW_PROMPT_TEMPLATE || DEFAULT_PR_REVIEW_PROMPT_TEMPLATE;
    const prReviewModel = core.getInput('model_name') || process.env.PR_REVIEW_MODEL || 'gpt-3.5-turbo-16k';

    // Set environment variables
    process.env.GH_TOKEN = githubToken;

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Get PR diff
    let prDiff = '';
    await exec.exec(`gh pr diff -R ${process.env.GITHUB_REPOSITORY} --patch ${process.env.GITHUB_EVENT_NUMBER}`, [], {
      listeners: {
        stdout: (data) => {
          prDiff += data.toString();
        },
      },
    });

    // Submit PR diff to GPT for review
    const response = await openai.chat.completions.create({
      model: prReviewModel,
      messages: [
        {
          role: 'system',
          content: prReviewPromptTemplate,
        },
        {
          role: 'user',
          content: prDiff,
        },
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Write the GPT response to a file
    const fs = require('fs');
    fs.writeFileSync('pr_review.txt', response.choices[0].message.content);

    // Add PR review comment
    await exec.exec(`gh pr review -R ${process.env.GITHUB_REPOSITORY} ${process.env.GITHUB_EVENT_NUMBER} -F pr_review.txt -c`);
    core.setOutput('pr_review', response.choices[0].message.content);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
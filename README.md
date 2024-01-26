# GitHub Pull Request Reviewer Action

This repository contains a GitHub Action that automates the process of reviewing pull requests using OpenAI's GPT model.

## Features

- Fetches the diff of the changes when a pull request is opened or updated.
- Submits the diff to the GPT model for review.
- Posts the model's response as a comment on the pull request.

## Usage

To use this action in your GitHub workflows, add a step to your workflow file that references this repository:

```yaml
- name: Run PR Reviewer
  uses: hdvinsurance/gpt-code-review-action@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
```

## Inputs

The action accepts the following inputs:

- `github_token` (**required**): The GitHub token used to post comments on the pull request. This is a required input.

- `openai_api_key`: The OpenAI API key. This is required if the `OPENAI_API_KEY` environment variable is not set. This input is optional.

- `pr_review_prompt_template`: Provide a PR review prompt template to optionally override the default prompt template with your own. This input is optional and defaults to an empty string.

- `model_name`: Optional. Defaults to `gpt-3.5-turbo-16k`.

## Outputs

The action produces the following output:

- `pr_review`: The PR review text. Note: this is the raw output from the GPT model and may contain newlines and other formatting characters.

## Considerations and Limitations

Code Reviews performed by a generative AI process may not always be correct. Exercise caution when evaluating the suggestions of the model.

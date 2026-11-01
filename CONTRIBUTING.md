# Contributing

## Getting Started

Install Githook (nice to have)
```
chmod +x .githooks/*
git config core.hooksPath .githooks
```

## What makes a good commit?

- A bad commit is too large, mixes unrelated changes, or is difficult to review.
- A good commit is small, focused, and easy to understand. Each commit should represent one logical change.

## Common workflows

1. Pull the latest code from `main`.
2. Create a new branch following the naming convention `<firstname>/<feature-short-name-in-kebab-case>`.
3. Code code code.
4. Test test test.
5. Once everything looks good, write a proper commit message. Ideally, your first commit should match the pull request title, since GitHub will use it as the default PR title, saving you the trouble of editing it. Subsequent commits can be named however you like, since they'll be squash-merged anyway (except when syncing upstream or preparing a release).
6. Need to make changes? Just commit again. Once everything's ready, push your branch and open a pull request.
7. Once everything looks good, ping the code owner and let them stare at your code. That's it.

## Using AI for coding

AI tools can help you explore ideas, understand code, draft changes, and write tests. You're still responsible for the code you submit.

- Start with a clear task and relevant context. Keep changes small and ask the tool to follow existing project patterns.
- Review every generated change. Make sure you understand it and can explain why it belongs in the project. Don't submit code you can't explain.
- Verify the result yourself: check assumptions, run relevant tests and checks, and try edge cases. An AI saying "it works" isn't verification.
- Keep the diff focused. Remove unrelated refactors, unnecessary dependencies, and generated code or comments that don't help.
- Never paste secrets, credentials, or private data into prompts. Only share project code with tools you're authorized to use for it.

## Must read resources

**About commit conventions:**

- [Commit message conventions (just for fun, we squash and merge anyway)](https://www.conventionalcommits.org/en/v1.0.0/)
- [Why Write Small CLs?](https://google.github.io/eng-practices/review/developer/small-cls.html)
- [Committing in two phases](https://github.com/git-guides/git-commit#committing-in-two-phases)

**About pull request conventions:**

- [Pull request conventions](https://cadenceworkflow.io/community/how-to-contribute/pull-request-conventions)

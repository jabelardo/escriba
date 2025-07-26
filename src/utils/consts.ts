export const DEFAULT_CONTINUE_PROMPT = `Instructions:
Continue the story below without repeating the story unless it is for literary effect. Include only the text you are adding. You should read what is before the tag and match the same style and tone, so the next text fits into the narrative properly. Always respond in the same language as the provided text.

Story:`;

export const DEFAULT_REVISION_PROMPT = `You will be doing a revision of text within the passage tags [passage][/passage]. Always make at least minor improvements - never return the text unchanged. You will include only text and not tags. Follow any instructions found in between [ ] inside of the passage. Always respond in the same language as the provided text.

Additional Context if Available (Ignore if not present):
{{context}}

[passage]{{selectedText}}[/passage]

Additional instructions for the revision if available (Ignore if not found):
{{userInput}}`;

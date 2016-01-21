# Design

This file contains informations about QuVault's design.

# Problems, questions, decks

The basic item is called a "problem".
This is something that can be displayed to the user for testing.
A problem normally has a single "question" for the user to answer,
but it might have many nested questions, such as an entire exam.

# Problems

## Problem files

Filenames should be UUIDs.
A file can contain various different types of content:

- A problem
- A deck (i.e. a list of references to questions)
- A list of problems and/or decks
- Media files
- A folder of files, rather than a single file
- Perhaps a ZIP or other archive file?

Problems and decks should be specified in JSON format.
Perhaps we can also permit other data formats that
convert easily to JSON, such as YAML and MsgPack.

## Data format for problems

A single question:

```yaml
quvault: 1
question: What does it mean for a graph to be strongly connected?
answer: (I think) there is a path from every node to every other node
```

A list of questions:

```json
{
  "quvault": 1,
  "questions": [
    {
      "question": "What does it mean for a graph to be strongly connected?",
      "answer": "(I think) there is a path from every node to every other node"
    }
  ]
}
```

A simplified format takes a list of questions.
Any item with a single property named "DEFAULTS"
will set default values that will be added to the following
items.

```yaml
- DEFAULTS:
    quvault: 1
- question: "1+3"
  answer": "4"
- question: "1+4"
  answer": "5"
```

# Responses

## Files

User responses are stored named something like this:
`userdata/${USERNAME}/${DATE_AND_TIME}-${RANDOMHASH}.sco1`

## Data format for responses

``[UUID, index, date, score, optional response, optional double-check-period, optional forced-half-life]``

```{json}
["1234125-12345-1245-125233", 1, "2016-01-02T12:03:23+01:00", 5, null, null, 1]
```

## The Recall Half-life

For each question, we store the response scores.
Scores on the integer scale 0-5, where 0 means completely forgotten
and 5 indicates immediate and correct recall.
These scores help determine the duration till the next review.

Starting off, we assume that there's a 50% chance of forgetting the answer in one day.
We refer to this as the *recall half-life* of 1 day.
After the next review, calculate the new half-life as follows:

score halflife2
----- ---------
    0 1
    1 `math.min(t*0.5, halflife1)`
    2 `math.min(t*0.7, halflife1)`
    3 `math.max(t*1.3, halflife1)`
    4 `math.max(t*2.0, halflife1)`
    5 `math.max(t*4.0, halflife1)`

where $t$ is the time in days since the last review,
and $halflife1$ was the previous half-life.

## Indexes

How to create a database index of problems and decks?  Consider that some problems may have numerous variations, and we only want to list the main problem template, not all the variations.  For the sake of performance, we should probably maintain this list, rather than generating it from directory contents all the time.

## Showing a problem

Given a question index, the server should return a complete
question object in JSON format and a link to a renderer.

## License and copyrights

Need to include fields for license and copyrights.
These should be obligatory for shared questions.

## Scoring answers

CONTINUE, consider also problems with multiple questions and
problems with many similar variants (e.g. a story problem
that can display different concrete values for its variables).

# Configuration

Should look in the standard places for config files (e.g. `$HOME/.config/quvault/quvault.yaml`).
Should be able to merge global and user configs.  In particular,
should be able to look in multiple directories for question files,
and it should be possible for a user to reference both global questions as
well as questions in some user directory.

The default directories are as follows:

* questions: `$HOME/.local/share/quvault/questions/` and `$HOME/.local/share/quvault/userdata/$USER/questions/`
* decks: `$HOME/.local/share/quvault/decks/` and `$HOME/.local/share/quvault/userdata/$USER/decks/`
* user responses: `$HOME/.local/share/quvault/userdata/$USER/scores/`

## Deck formats

```{yaml}
decks:
  XXXXX:
    name: Some Deck 1
---
decks:
  YYYYY:
    name: Some Deck 2
    parent: XXXXX
---
questions:
  QQQQQ:
    decks:
      YYYYY: true
```

Some file `*.dec1`:
```
{"type": "deckCreate", "uuid": "XXXXX", "name": "Some Deck 1"}
{"type": "deckCreate", "uuid": "YYYYY", "name": "Some Deck 2", "parent": "XXXXX"}
[["decks", "XXXXX"], {"name": "Some Deck 1", "status": "active"}]
[["decks", "YYYYY"], {"name": "Some Deck 2", "parent": "XXXXX", "status": "active"}]
[["decks", "ZZZZZ"], {"name": "Some Deck 3", "parent": "XXXXX", "after": "YYYYY", "status": "active"}]
[["questions", "QQQQQ"], {"decks": {"YYYYY": true}]
```

# User data

A user first needs to select problems by either selecting them individually or
from "decks" (i.e. lists of problems).

Q: Where should the system decks be stored?
Q: Where should local decks be stored?
Q: Where should the user's selection of problems and decks be stored?

Then when users score their responses to questions, this is saved in a session file.

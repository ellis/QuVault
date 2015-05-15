# Design

## Problems, questions, decks

The basic item is called a "problem".
This is something that can be displayed to the user for testing.
A problem normally has a single "question" for the user to answer,
but it might have many nested questions, such as an entire exam.

## Files

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

## Data format

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

## Indexes

How to create an index of problems and decks?  Consider that some problems may have numerous variations, and we only want to list the main problem template, not all the variations.  For the sake of performance, we should probably maintain this list, rather than generating it from directory contents all the time.

## Showing a problem

Given a question index, the server should return a complete
question object in JSON format and a link to a renderer.

## License and copyrights

Need to include fields for license and copyrights.
These should be obligatory for shared questions.

## Scoring answers

CONTINUE, consider also problems with multiple questions.

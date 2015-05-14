# Design

## Files

Filenames should be UUIDs.
A file can contain various different types of content:

- A question
- A deck (i.e. a list of references to questions)
- A list of questions and/or decks
- Media files
- A folder of files, rather than a single file
- Perhaps a ZIP or other archive file?

Questions and decks should be specified in JSON format.
Perhaps we can also permit other data formats that
convert easily to JSON, such as CSON, YAML, and MsgPack.

## Data format

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

```json
[
  {"DEFAULTS": {"quvault": 1}}
]
```

## Indexes

How to create an index of problems and decks?  Consider that some problems may have numerous variations, and we only want to list the main problem template, not all the variations.  For the sake of performance, we should probably maintain this list, rather than generating it from directory contents all the time.

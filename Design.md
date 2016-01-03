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

## Data format for responses

For each question, we store the response scores.
Scores on the integer scale 0-5, where 0 means completely forgotten
and 5 indicates immediate and correct recall.
These scores help determine the duration till the next review.

Starting off, we assume that there's a 50% chance of forgetting the answer in one day.
For the next review, calculate the probability of remembering as follows:

$$r = 2^{-t/T}$$

where $r$ is the probability of remembering,
$t$ is the time in days since the last review,
and $T$ is the estimated "half-life" of memory
(the number of days until we expect a 50% chance of remembering).

The expected score is drawn from this table:

   y  score
----  -----
  90      5
  70      4
  50      3
  30      2
  10      1
   0      0
----  -----

# Adjust tau as follows:
#  If the actual score is higher than the expected score, tau *= (actual - expected + 1)
#  If the actual score is lower than the expected score, tau /= (actual - expected + 1)

# d: half-life in days

ts = c(0)
ds = c(1)
taus = ds/0.693
actuals = c(0)
exp(-(1:10)/taus)

# [date, UUID/IDX, score, double-check-period, optional forced-half-life]
# ["2016-01-02T12:03:23.02+01:00", "1234125-12345-1245-125233/1", 5, -1, 1]


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

* [x] cli: handle loading of a YAML problem set: Test with `npm run cli -- --import ../website/Algorithms1.yaml -d`
* [ ] cli: command to add UUIDs to problems in problem set and write it back to disk
* [ ] cli: handle importing of problem sets, creating a file for each problem
* [ ] cli: specify a question with UUID/index
* [ ] allow for several modes: flashcard, exam, exam with answers, compact list, compact list with answers
* [ ] allow for rendering to markdown, HTML, and interactive HTML
* [ ] try creating a simple chemistry problem
* [ ] try creating a complex chemistry problem
* [ ] try scoring an answer
* [ ] save question scores
* [ ] generate spaced repetition plan
* [ ] handle media, hashed filenames


Old:

- [x] router URL for specific flashcard
- [x] create github repository
- [x] create nicer looking website header
- [ ] work through http://www.sitepoint.com/creating-note-taking-app-react-flux/
- [ ] look at http://learnreact.robbestad.com/#/home
- [ ] when importing, put problems in their own separate files, filename is UUID of problem
- [ ] consider using Web Components instead of React for rending questions, in order to be able to integrate CSS and JavaScript better
- [ ] create view for list of problems
- [ ] add flag to problem that indicates whether user should be prompting to type in the answer
- [ ] create a sample text problem with multiple flashcards
- [ ] create a transformer
- [ ] write server code to provide the list of problems
- [ ] for answers, save score, date to hide question till, and something about the status of the card so that we'll know how long to hide it next time
- [ ] for scheduling flashcard review, sort past answer data appropriately
- [ ] create way to organize deck of cards
- [ ] the default UUID of a problem is it's HASH
- [ ] what about storing multiple problems in a single file?
- [ ] the UUID should identify a file or folder first, which may contain one or more problems
- [ ] figure out how to create flashcards for Jeromin's french
- [ ] more flexible problem/deck file structure
    - [ ] allow for a file to contain multiple problems and decks
    - [ ] how to distinguish problems from decks?
- [ ] support multiple users
- [ ] in JSON files, allow for pragmas that define default values for all following items in a list (e.g. 'DEFAULTS')

# Future todos

- [ ] figure out way to handle UUID clashes when importing problems
- [ ] handle a folder of problems
- [ ] handle ZIP files for problems

# UI Structure

- dashboard with current decks, statistics
- browse repository of problems
- pick a specific question
- edit stuff
- start a question session

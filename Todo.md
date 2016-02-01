* [x] cli: handle loading of a YAML problem set: Test with `npm run cli -- --import ../website/Algorithms1.yaml -d`
* [x] cli: command to add UUIDs to problems in problem set and write it back to disk: `npm run cli -- --import problemSets/Algorithms1.yaml -d -u`
* [x] cli: handle importing of problem sets, creating a file for each problem
* [x] cli: specify a question with `UUID/index`
* [x] score a response
* [x] cli: initial code for interactive shell
* [x] cli: create session file and write scores to it (userdata/$USERNAME/2016-01-04T12:00:00-as9d0fn4340.json)
* [x] cli: load in all userdata
* [x] halflife.js: attenuate change in half-life linearly for responses less than 12h, 24h, or previous half-life?
* [x] halflife.js: if it's been too long since user answered question and they got it wrong, reduce half-life more severely (perhaps even reset to 1)
* [x] new tests, one per halflife (over a range of half lives), where the matrix is t=..., score=0..5
* [x] userdata.js: calculate question half-lives for all scored questions
* [x] user directory should probably have a list of active questions, because on a shared system, different users will want different questions
* [x] for a single-user setup, load data in `.local/share/` directory
* [x] cli: look for questions in XDG directories
* [x] cli: look for userdata in XDG directory
* [x] replace nomnom with commander
* [x] try vorpal instead of inquirer
* [x] main-start.js -- for an interactive Q&A session
* [x] main-start: print help to console if no commands are given
* [x] main-start: create `dump` command
* [x] main-start: rename program state from `decks` to `state`
* [x] repl:
	* [x] `decks`: list active decks
	* [x] create `Medley.setMut` function
	* [x] for all problems in a deck, query the problem file to discover out how many questions it has
	* [x] calculate question half-lives for all questions with history
	* [x] calculate question half-lives for all questions, including ones that haven't been scored yet
	* [x] cli: calculate weighted, randomized order to present questions (see calcReviewList())
* [x] main-import.js -- for importing problem sets
	* [x] create it
	* [x] create deck file for problem set
	* [x] add 'addUuid' and 'debug' options to program
* [x] loadDecks(): load the complete deck files created by import
* [x] why isn't new deck .json being loaded?
* [x] keep new questions in the original order
* [x] `decks` command: list number of pending questions for each active deck
* [x] `decks` command: add indexes
* [x] make `config` become member of `state`
* [ ] repl: allow for interactive question scoring
* [ ] figure out how to manage importing a file multiple times to ensure that UUID is stable and that questions get properly added and removed
	* [ ] append date to filename, delete older files
	* [ ] load from deckDirs in the proper order
* [ ] repl: for a single-user setup, save data in `.local/share/` directory
* [ ] repl: `createDeck`: create a new deck
* [ ] repl: `createProblem`: create a new problem
* [ ] move Design.md and Todo.md to src/ folder
* [ ] delete old cli.js
* [ ] cli: read configuration information from .config/quvault/quvault.yaml, with directory information
* [ ] start a `medley-data` library?  Merge functions would never automatically create arrays, even if a number was in the path; lists could be extracted from maps
* [ ] main-start: refactor code so that we don't need to duplicate the `program` and `vorpal` commands
* [ ] try creating a simple chemistry problem
* [ ] try creating a complex chemistry problem
* [ ] try creating a simple 2-way vocabulary problem
* [ ] try creating a native/spoken/written vocabulary problem
* [ ] try creating a complex vocabulary problem (i.e. multiple translations possible)
* [ ] implement several modes: flashcard, exam, exam with answers, compact list, compact list with answers
* [ ] implement rendering to markdown, HTML, and interactive HTML
* [ ] save question scores
* [ ] generate spaced repetition plan
* [ ] handle media, hashed filenames
* [ ] repl: consider displaying amount of time spent answering questions
* [ ] delegate halflife calculations to the problem type, in order to support such things as problems with infinite variants on questions


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

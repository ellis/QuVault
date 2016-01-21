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
* [ ] cli: read configuration information from .config/QuVault/QuVault.yaml, with directory information
* [ ] load users' deck lists
    * [ ] load all
* [ ] start a `medley-data` library?
* [ ] user directory should probably have a list of active questions, because on a shared system, different users will want different questions
* [ ] cli: calculate question half-lives for all questions, including ones that haven't been scored yet
* [ ] cli: calculate weighted, randomized order to present questions
* [ ] cli: for a single-user setup, load/save data in `.local/share/` directory
* [ ] cli: look for questions in a configurable directory
* [ ] cli: look for userdata in a configurable directory
* [ ] replace nomnom with commander
    * [ ] split cli.js into multiple files `main-*.js`
    * [ ] main-import.js -- for importing problem sets
    * [ ] main-start.js -- for an interactive Q&A session
* [ ] repl: support top-level commands (e.g. 'start')
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

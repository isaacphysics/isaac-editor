# isaac-editor

The Isaac Physics Content Editor, used to create the JSON site content for the Isaac Physics project.


#### Using the Content Editor

To use the editor, visit one of the running examples, currently [editor.isaacphysics.org](https://editor.isaacphysics.org) or [editor.isaaccomputerscience.org](https://isaaccomputerscience.org). You will need to have been granted access to the GitHub project in order to use either of these.

Files can be browsed from the menu on the left, and edited by clicking on them. The UI hides away the underlying JSON, but it can be accessed by clicking the grey `Content Object` banner at the top left of any content block.


#### Developing the Content Editor

To develop the content editor: check out this repo, run `npm start`, and then visit `localhost:8421` in a web browser.
To update the css run `npx grunt`.

You may find it useful to edit [`github_application.js`](app/js/app/github_application.js) to change the OAuth settings, or to alter the remote repository the editor connects to in [`services.js`](app/js/app/services.js). Both of these are configured on a per-hostname basis.
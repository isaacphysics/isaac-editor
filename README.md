# isaac-editor

The old Isaac Physics Content Editor, used to create the JSON site content for the Isaac Physics project. This project used React components inside an AngularJS app. It was used from 2014 until 2022, when it was superseded by [isaac-content-editor](https://github.com/isaacphysics/isaac-content-editor), a modern React app replacement.


#### Developing the Content Editor

To develop the content editor: 
* Check out this repo
* Run `npm run sass` to generate the CSS
* Run via `npm start`, and then visit `localhost:8421` in a web browser

You may find it useful to edit [`github_application.js`](app/js/app/github_application.js) to change the OAuth settings, or to alter the remote repository the editor connects to in [`services.js`](app/js/app/services.js). Both of these are configured on a per-hostname basis.

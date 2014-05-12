/*
 *  To deploy tealight:
 *
 *  1) Deploy the static tealight directory to your web server
 *
 *  2) Register your tealight URL as an application on Github: https://github.com/settings/applications/new
 *
 *  3) Visit the tealight auth server (currently http://www-dyn.cl.cam.ac.uk/~ipd21/tealight-auth-server/ )
 *     and exchange your client_id and client_secret for your tealight_auth_code
 *
 *  4) Fill in the placeholders below with your actual client_id and tealight_auth_code
 *
 *  5) Rename this file to "github_application.js"
 *
 *  6) Enjoy using tealight!
 *
 */

define(function() {

    return {
        authServer: "http://www-dyn.cl.cam.ac.uk/~ipd21/tealight-auth-server/",

        hosts: {
        	"localhost:8000": {
        		clientId : "f4de972464cb742d3671",
        		authCode : "6a5b3c00548a75fa03e873e0c2cc5ed39de18f879165164d63d61c0acabf791e9a44567555b0a8f69cb1d1fc65a86376a1653ee601dcced8987e235ad61cbbc4ce98702ac03a0dbc78b81eb182c4562dd436e94a745bf195c423097b275f93af"
        	},
            "www.cl.cam.ac.uk": {
                clientId : "684f073bca20ddf30b76",
                authCode : "2ad8374cb67c803ee14086be6e7dca1147e659a29da0575417125efb13d699652b3ed9a73fe97ab4b1017ad9e2adfa810d21ee81e39460d8812c33ae15103d866c766b342b6727df169984157d19ab8ffa3794e4e68d10d0455f59410d564aef",
            },
            "tealight.github.io": {
                clientId : "382df8e67b1f810c99a3",
                authCode : "d42ab912388a8deb41a875310c06b54743e9b90deabd127f88436ab98a9c0b294e4fc75e0a81bce5ee631b4fe74af4c26a9af49f1cfd8e26529b3471f611b11ccace2ec416f827013ec600caae16bf5cde99e5714601835436263411b5795a1c",
            },
        }
    };
});

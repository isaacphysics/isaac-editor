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

define({
	tealight_auth_server: "http://www-dyn.cl.cam.ac.uk/~ipd21/tealight-auth-server/",
    
    hosts: {
    	"localhost:8000": {
    		github_client_id    : "f62f2bd4954bf930bc3f",
    		tealight_auth_code  : "61120506c461e0cf49965db3f9cf7347c68b6a235b06fb9c437e5ee4d3f81c1707b0c69f30eccc795f4368a482e104cdb5d78d0b0c728db102512b51146671349deddd6ff2900e90e7c97433b7f5fe25b14c60d7deae292a1037c14acbb22bf7"
    	},
    	"www.cl.cam.ac.uk": {
			github_client_id    : "684f073bca20ddf30b76",
			tealight_auth_code  : "2ad8374cb67c803ee14086be6e7dca1147e659a29da0575417125efb13d699652b3ed9a73fe97ab4b1017ad9e2adfa810d21ee81e39460d8812c33ae15103d866c766b342b6727df169984157d19ab8ffa3794e4e68d10d0455f59410d564aef",
    	},
    }
});


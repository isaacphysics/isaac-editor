/*
 *  To authenticate to GitHub, we use a standard OAuth app. But isaac-editor runs entirely
 *  in the browser, and so a server somewhere is needed to protect the app secrets.
 *
 *  The authentication server must accept GET requests, containing three URL parameters:
 *  an encrypted 'authCode', the OAuth client ID and a temporary code from GitHub. It should
 *  decrypt the 'authCode' which contains the client secret, and make a request to GitHub for
 *  the user's access token, which it should return in the JSON response body.
 * 
 *  A functional server exists below, and can be used to configure further host names.
 *
 *  1) Either implement a login server of your own, or use that specified below.
 *
 *  2) Register your URL as an application on GitHub: https://github.com/settings/applications/new
 *
 *  3) Visit your authServer (or https://editor-auth.isaacphysics.org) and exchange your 
 *     OAuth app client_id, client_secret and origin for your authCode.
 *
 *  4) Fill in the placeholders below with your actual client_id and authCode.
 *
 */

define(function() {

    return {
        authServer: "https://editor-auth.isaacphysics.org/_/api/authenticate",

        hosts: {
            "localhost:8421": {
                clientId: "f62f2bd4954bf930bc3f",
                authCode: "/vFaDdbb7id6+cPgsIKTdvwk4lOLBkBpBsXDdBvZsnU0U/PBLxgzxDzmUfE/0OIWWvlxh7SigvVv1JzBffbEc2364W8GPmQt9QeuVW1juAHdvdT7kRrHv8LjEuxJP9ie9+BP3tXNWpVxdg7S3sbZA5ShBFOYxdr3izjn9L+cmzDT9YVKB+Grv8hvLcEFOy7KHeixa29HPY2pqtk6XHFqiwlDP+02AWmY"
            },
            "localhost:8001": {
                clientId: "9f116929fbccfc311e1c",
                authCode: "eGpwSEepHckY9T4tHG7Ej2yVP+ALt3vToIy9BIbXP/vI79SrzHZha/AY5MZSHTRClcErY7fxsVG3K6k4kXmeD1j4AtoYz3lwTio53zMF//3I/3Nc5nDFMygdelk5oL74w+/+CFTqmuat8GRWqJVe+MBXUo5VzrPpgAn3VginSjj6XvFOhWH9qw0TsS/T1KICZQL+nJD8BYyWj5dX8QilSGhY+gMpJ0T6"
            },
            "editor.isaacphysics.org": {
                clientId : "012d68f7ffd3a99110ff",
                authCode : "j4GsAFDYXaxqwN146vTeQ4vbV7ucQtGC8B4AI7EVQPIUTQG/nz9Yfgm1o3d0FLrDlgGyig2YyxA8IMS1wVF+mZ7rCMzOZUXGIn48gDxFGzsWZKhK36kwra5PE3C6mCeRQjXx6cCyl9VRH1VR+RsjIXM6vIdD0g1JqcupsKDNmojZAcuMkPreJfl2h+bbss1DGw3CdvNLF8lwd895OTNwZfGjQxcmywIS3VIC7o6JIq3fcw==",
            },
            "editor.isaaccomputerscience.org": {
                clientId : "f929345390ca5ca6e1ba",
                authCode : "WD4uGrm2iTFxmvwHjybnCSzIpgFk3r//7twVti62RpnQWyFteaKK11q6wLBQX6bb/yy9NY9t0m79MxokXUVZpRNzczPvBAkW6WGfmdCUa5tNs3UMswWmpITiv/TiGHJKxDRZ9m2KYgly3jqLzEU1EY7KznCCa16x7MLzdcQzyYKYS49RB3V/+B7IsuyDPQLRVffRTe/2MkrZmx98kj9x14eMgteIRQ7aYhi1pDsYE1dVGOMyojgoPsf6",
            },
        }
    };
});

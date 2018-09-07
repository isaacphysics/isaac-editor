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
        authServer: "https://editor-auth.isaacphysics.org/_/api/authenticate",

        hosts: {
            "localhost:8000": {
                clientId: "f62f2bd4954bf930bc3f",
                authCode: "42/IwZuGCfI7TdKKr4KMfUIqYDQcvb5Cc/apZBuyjVnQLInfgkrMuda39OsBunIaQh9B5f2DdYPPsAOhPtJ0HdDpcYkgHPxy1LO/BtpLn1UUxku88hgAndWqmux2x0+A+Q/uZotyNBL8mZaLEALNzghXgoTPaqdbnKO/PytrgNWWvg0IOM3NTL8mz1rT/hz2QNOiuuW5Qndsfjo1RtAp+pDZx07/kvAF"
            },
            "localhost:8001": {
                clientId: "9f116929fbccfc311e1c",
                authCode: "eGpwSEepHckY9T4tHG7Ej2yVP+ALt3vToIy9BIbXP/vI79SrzHZha/AY5MZSHTRClcErY7fxsVG3K6k4kXmeD1j4AtoYz3lwTio53zMF//3I/3Nc5nDFMygdelk5oL74w+/+CFTqmuat8GRWqJVe+MBXUo5VzrPpgAn3VginSjj6XvFOhWH9qw0TsS/T1KICZQL+nJD8BYyWj5dX8QilSGhY+gMpJ0T6"
            },
            "editor.isaacphysics.org": {
                clientId : "012d68f7ffd3a99110ff",
                authCode : "j4GsAFDYXaxqwN146vTeQ4vbV7ucQtGC8B4AI7EVQPIUTQG/nz9Yfgm1o3d0FLrDlgGyig2YyxA8IMS1wVF+mZ7rCMzOZUXGIn48gDxFGzsWZKhK36kwra5PE3C6mCeRQjXx6cCyl9VRH1VR+RsjIXM6vIdD0g1JqcupsKDNmojZAcuMkPreJfl2h+bbss1DGw3CdvNLF8lwd895OTNwZfGjQxcmywIS3VIC7o6JIq3fcw==",
            },
            "editor2.isaacphysics.org": {
                clientId : "f929345390ca5ca6e1ba",
                authCode : "5WMdisjgJG0pjZdGULeD7uPndfjRuHoFra70qPXlx2EPxfo9ZBSgFoy34ZH7URQINGDw7btOi5yZ9lte/vY1Cqf6pOtB9Bj0FC5inRbi++1gqo2FjsAHRSIzeZSNMyixy6dpbT90H3I+3GWQfMqhL3D87XBTrIUEgA0YNqRm0TWxVibN+/SQJlGmIgYZ2L1zYTHeG3DeNioLSscbbg9Q7E6opER9QHJiqlceDCi7rRFb5c8=",
            },
        }
    };
});

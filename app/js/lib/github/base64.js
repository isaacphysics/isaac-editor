define([], function() {
    "use strict";

    // See https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    // Code inside the //===// section comes from Mozilla:
    //==================================================================================//
    var log = Math.log;
    var LN2 = Math.LN2;
    var clz32 = Math.clz32 || function(x) {return 31 - log(x >>> 0) / LN2 | 0};
    var fromCharCode = String.fromCharCode;
    var originalAtob = atob;
    var originalBtoa = btoa;

    function btoaReplacer(nonAsciiChars) {
        // make the UTF string into a binary UTF-8 encoded string
        var point = nonAsciiChars.charCodeAt(0);
        if (point >= 0xD800 && point <= 0xDBFF) {
            var nextcode = nonAsciiChars.charCodeAt(1);
            if (nextcode !== nextcode) // NaN because string is 1 code point long
              return fromCharCode(0xef/*11101111*/, 0xbf/*10111111*/, 0xbd/*10111101*/);
            // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            if (nextcode >= 0xDC00 && nextcode <= 0xDFFF) {
                point = (point - 0xD800) * 0x400 + nextcode - 0xDC00 + 0x10000;
                if (point > 0xffff)
                    return fromCharCode(
                        (0x1e/*0b11110*/<<3) | (point>>>18),
                        (0x2/*0b10*/<<6) | ((point>>>12)&0x3f/*0b00111111*/),
                        (0x2/*0b10*/<<6) | ((point>>>6)&0x3f/*0b00111111*/),
                        (0x2/*0b10*/<<6) | (point&0x3f/*0b00111111*/)
                    );
            } else return fromCharCode(0xef, 0xbf, 0xbd);
        }
        if (point <= 0x007f) return nonAsciiChars;
        else if (point <= 0x07ff) {
            return fromCharCode((0x6<<5)|(point>>>6), (0x2<<6)|(point&0x3f));
        } else return fromCharCode(
            (0xe/*0b1110*/<<4) | (point>>>12),
            (0x2/*0b10*/<<6) | ((point>>>6)&0x3f/*0b00111111*/),
            (0x2/*0b10*/<<6) | (point&0x3f/*0b00111111*/)
        );
    }
    var btoaUTF8 = function(inputString, BOMit){
        console.log("ENCODE");
        return originalBtoa((BOMit ? "\xEF\xBB\xBF" : "") + inputString.replace(
            /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g, btoaReplacer
        ));
    }
    //////////////////////////////////////////////////////////////////////////////////////
    function atobReplacer(encoded){
        var codePoint = encoded.charCodeAt(0) << 24;
        var leadingOnes = clz32(~codePoint);
        var endPos = 0, stringLen = encoded.length;
        var result = "";
        if (leadingOnes < 5 && stringLen >= leadingOnes) {
            codePoint = (codePoint<<leadingOnes)>>>(24+leadingOnes);
            for (endPos = 1; endPos < leadingOnes; ++endPos)
                codePoint = (codePoint<<6) | (encoded.charCodeAt(endPos)&0x3f/*0b00111111*/);
            if (codePoint <= 0xFFFF) { // BMP code point
                result += fromCharCode(codePoint);
            } else if (codePoint <= 0x10FFFF) {
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                codePoint -= 0x10000;
                result += fromCharCode(
                    (codePoint >> 10) + 0xD800,  // highSurrogate
                    (codePoint & 0x3ff) + 0xDC00 // lowSurrogate
                );
            } else endPos = 0; // to fill it in with INVALIDs
          }
          for (; endPos < stringLen; ++endPos) result += "\ufffd"; // replacement character
          return result;
    }
    var atobUTF8 = function(inputString, keepBOM){
        console.log("DECODE");
        if (!keepBOM && inputString.substring(0,3) === "\xEF\xBB\xBF")
            inputString = inputString.substring(3); // eradicate UTF-8 BOM
        // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
        // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
        return originalAtob(inputString).replace(/[\xc0-\xff][\x80-\xbf]*/g, atobReplacer);
    };
    //==================================================================================//

    // To ensure compatibility, do not allow accidental passing of second argument, and
    // provide two methods called 'atob' and 'btoa' as older versions of this code did:
    var atobUTF8_ignoreBOM = function(inputString) {
        return atobUTF8(inputString, false);
    }
    var btoaUTF8_ignoreBOM = function(inputString) {
        return btoaUTF8(inputString, false);
    }
    return {atob: atobUTF8_ignoreBOM, btoa: btoaUTF8_ignoreBOM};
});
var postcss = require('postcss');

module.exports = postcss.plugin('sass-colors', function (opts) {
    opts = opts || {};

    // Calls the Color.js library for the conversion
    function colorConvert( percentage, option, colorValue ) {
        var color    = require( 'color' );
        var newColor = color( colorValue.trim() );
        var newValue = '';

        switch ( option.trim() ) {
        case 'darken':
            newValue = newColor.darken( percentage ).hexString();
            break;

        case 'lighten':
            newValue = newColor.lighten( percentage ).hexString();
            break;

        case 'rgb':
            newValue = newColor.clearer( percentage ).rgbString();
            break;

        default:
            return '';
        }

        return newValue;
    }

    // Gets the type of conversion is needed for the current string
    function colorInit( oldValue ) {
        var color, percentage, colorArgs, colorValue, cssString;
        var balanced = require( 'balanced-match' );

        //
        cssString  = balanced( '(', ')', oldValue );
        colorArgs  = balanced( '(', ')', cssString.body );
        colorValue = balanced( '(', ')', colorArgs.body );

        // If colorValue is undefined, the value is an rbg or similar color.
        if ( undefined !== colorValue ) {
            color      =  colorValue.pre + '( ' + colorValue.body + ' )';
            percentage = colorValue.post;

        } else {
            // The value is an hexadecimal sting or html color
            var hexColor = colorArgs.body.split( ',' );
            color = hexColor[0].trim();

            if (  undefined === hexColor[1] ) {
                percentage = '';
            } else {
                percentage = hexColor[1].trim();
            }
        }

        // Cleans the variable
        if ( percentage ) {
            percentage = percentage.replace( ',', '' ).trim();
            percentage = percentage.replace( '%', '' ) / 100;

        } else {
            // Check if the percentage is undefine or empty and set it to 0
            percentage = '0';
        }

        return colorConvert( percentage, colorArgs.pre, color );
    }

    return function ( css ) {
        css.walkDecls( function ( decl ) {

            // Regex for searching the color values.
            var regEx = /color\(([^)]+)\)\s*\)/g;
            var index = decl.value.match( regEx );

            if ( !decl.value || index === null ) {
                return;
            }
            var _iterator, _isArray, _i, Symbol;
            // Iterated all the matches and calls the plugin logic
            for (_iterator = index, _isArray = Array.isArray(_iterator),
                _i = 0, _iterator = _isArray ? _iterator :
                _iterator[Symbol.iterator](); ;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var current = _ref;

                var newColor = colorInit(current);
                decl.value = decl.value.replace(current, newColor);
            }

            decl.value = decl.value;
        });
    };
});

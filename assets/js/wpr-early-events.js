(function ( d, w ) {
	var li  = 0;
	var lc  = '';
	var xhr = new XMLHttpRequest();

	w.realOnload              = w.onload;
	w.realAddEventListener    = w.addEventListener;
	w.Rocket                  = w.Rocket || {};
	w.Rocket.DOMContentLoaded = false;
	w.Rocket.eventStacks      = {
		ready:  [],
		onload: []
	};

	function holdOnready() {
		if ( typeof jQuery !== 'undefined' && typeof jQuery.fn.realReady === 'undefined' ) {
			jQuery.fn.realReady = jQuery.fn.ready;
			jQuery.fn.ready     = function ( cb ) {
				w.Rocket.eventStacks.ready.push( cb );
				return false;
			};
		}
	}

	function releaseOnready() {
		if ( typeof jQuery !== 'undefined' ) {
			while ( w.Rocket.eventStacks.ready.length > 0 ) {
				var f = w.Rocket.eventStacks.ready.shift();

				if ( typeof f === 'function' ) {
					f( jQuery );
				}
			}

			jQuery.fn.ready = jQuery.fn.realReady;
		}

		if ( ! w.Rocket.DOMContentLoaded ) {
			w.Rocket.DOMContentLoaded = true;
			d.dispatchEvent( new Event( 'Rocket.DOMContentLoaded' ) );
		}
	}

	function releaseOnload() {
		while ( w.Rocket.eventStacks.onload.length > 0 ) {
			var f = w.Rocket.eventStacks.onload.shift();

			if ( typeof f.cb === 'function' ) {
				if ( typeof f.e === 'undefined' ) {
					f.cb();
				} else {
					w.realAddEventListener( 'load', f.cb );
				}
			}
		}

		w.addEventListener = w.realAddEventListener;
		w.onload           = w.realOnload;

		setTimeout( function () {
			w.dispatchEvent( new Event( 'load' ) );
		}, 1 );
	}

	w.addEventListener = function ( e, cb ) {
		if ( "load" === e ) {
			w.Rocket.eventStacks.onload.push( {
				e:  e,
				cb: cb
			} );
			return false;
		}

		w.realAddEventListener( e, cb );
	};

	w.onload = function ( cb ) {
		w.Rocket.eventStacks.onload.push( {
			cb: cb
		} );
		return false;
	};

	xhr.open( 'GET', '%%scripts_url%%' );

	xhr.onload = function () {
		releaseOnready();
		releaseOnload();
	};

	xhr.onprogress = function () {
		var i, s;
		var ci = xhr.responseText.length;

		if ( li === ci ) {
			try {
				eval.call( w, lc ); // eslint-disable-line no-eval
			} catch ( e ) {} // eslint-disable-line no-empty

			holdOnready();
			return;
		}

		s = xhr.responseText.substring( li, ci ).split( '%%scripts_boundary%%' );

		for ( i in s ) {
			if ( i !== s.length - 1 ) {
				try {
					eval.call( w, lc + s[ i ] ); // eslint-disable-line no-eval
				} catch ( e ) {} // eslint-disable-line no-empty

				holdOnready();
				lc = '';
			} else {
				lc += s[ i ];
			}
		}

		li = ci;
	};

	xhr.send();
})( document, window );

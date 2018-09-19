<?php
namespace WP_Rocket\Optimization\JS;

/**
 * Minify JS files.
 *
 * @since  3.2
 * @author Grégory Viguier
 */
class Minifier extends \MatthiasMullie\Minify\JS {
	/**
	 * Regex pattern used to match multi-line comments.
	 *
	 * @since  3.2
	 * @access protected
	 * @author Grégory Viguier
	 *
	 * @var string
	 */
	protected $script_separator = '';

	/**
	 * Minify the data.
	 * Perform JS optimizations.
	 *
	 * @since  3.2
	 * @access public
	 * @author Grégory Viguier
	 *
	 * @param  string $path Path to write the data to.
	 * @return string       The minified data
	 */
	public function execute( $path = null ) {
		$content = [];

		/*
		* Let's first take out strings, comments and regular expressions.
		* All of these can contain JS code-like characters, and we should make sure any further magic ignores anything inside of these.
		*
		* Consider this example, where we should not strip any whitespace:
		* var str = "a   test";
		*
		* Comments will be removed altogether, strings and regular expressions will be replaced by placeholder text, which we'll restore later.
		*/
		$this->extractStrings( '\'"`' );
		$this->stripComments();
		$this->extractRegex();

		// Loop files.
		foreach ( $this->data as $source => $js ) {
			// Take out strings, comments & regex (for which we've registered the regexes just a few lines earlier).
			$js = $this->replace( $js );
			$js = $this->propertyNotation( $js );
			$js = $this->shortenBools( $js );
			$js = $this->stripWhitespace( $js );

			$content[] = $js;
		}

		$content = implode( $content, ';' . $this->script_separator );

		// Clean up leftover `;`s from the combination of multiple scripts.
		$content = ltrim( $content, ';' );
		$content = (string) substr( $content, 0, -1 );

		// Earlier, we extracted strings & regular expressions and replaced them with placeholder text. This will restore them.
		$content = $this->restoreExtractedData( $content );

		return $content;
	}

	/**
	 * Set a new script separator. It should be a JS comment.
	 *
	 * @since  3.2
	 * @access public
	 * @author Grégory Viguier
	 *
	 * @param string $separator The separator.
	 */
	public function set_script_separator( $separator = '' ) {
		$this->script_separator = $separator;
	}

	/**
	 * Reset the script separator to default.
	 *
	 * @since  3.2
	 * @access public
	 * @author Grégory Viguier
	 */
	public function reset_script_separator() {
		$this->script_separator = '';
	}
}

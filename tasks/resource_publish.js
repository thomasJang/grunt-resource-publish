/*
 * grunt-resource-publish
 * https://github.com/thomasJang/grunt-resource-publish
 *
 * Copyright (c) 2015 ThomasJ
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('resource_publish', 'The best Grunt plugin ever.', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({});

		// Iterate over all specified file groups.
		this.files.forEach(function (f) {
			// Concat specified files.

			var src = f.src.filter(function (filepath) {
				// Warn on and remove invalid source files (if nonull was set).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});


			src.forEach(function(filepath){
				grunt.log.writeln(filepath);
			});

			//grunt.log.writeln('File "' + f.dest + '" created.');
		});
	});

};

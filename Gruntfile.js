/*
 * grunt-resource-publish
 * https://github.com/thomasJang/grunt-resource-publish
 *
 * Copyright (c) 2015 ThomasJ
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		clean: {
			tests: ['test/target']
		},
		copy: {
			main: {
				files: [
					// includes files within path
					{expand: true, cwd: 'test/original/', src: ['**'], dest: 'test/target/'},
				]
			}
		},


		// Configuration to be run (and then tested).
		resource_publish: {
			run: {
				options: {
					detect: {
						js: true,
						css: false
					}
				},
				files: [
					{
						src: 'test/target/**/*.html',
						resource_dest: "test/target/__"
					}
				]
			}
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['resource_publish']);
	grunt.registerTask('reset_test', ['clean','copy']);
};

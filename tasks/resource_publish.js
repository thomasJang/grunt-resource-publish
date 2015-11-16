/*
 * grunt-resource-publish
 * https://github.com/thomasJang/grunt-resource-publish
 *
 * Copyright (c) 2015 ThomasJ
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var chalk = require('chalk');
var maxmin = require('maxmin');

function times(s, count) {
	return count < 1 ? '' : new Array(count + 1).join(s);
}
function set_digit(num, length, padder, radix) {
	var s = num.toString(radix || 10);
	return times((padder || '0'), (length - s.length)) + s;
}
function get_time_serial() {
	var now = new Date();
	return now.getFullYear() + set_digit(now.getMonth(), 2) + set_digit(now.getDate(), 2) + set_digit(now.getHours(), 2) + set_digit(now.getMinutes(), 2) + set_digit(now.getSeconds(), 2);
}
// Converts \r\n to \n
function normalizeLf(string) {
	return string.replace(/\r\n/g, '\n');
}

module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks
	var uglify = require('./lib/uglify').init(grunt);

	grunt.registerMultiTask('resource_publish', 'The best Grunt plugin ever.', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			banner: '',
			footer: '',
			compress: {
				warnings: false
			},
			mangle: {},
			beautify: false,
			report: 'min',
			expression: false,
			maxLineLen: 32000,
			ASCIIOnly: false,
			screwIE8: false,
			quoteStyle: 0
		});
		var banner = normalizeLf(options.banner);
		var footer = normalizeLf(options.footer);

		var script_resource = {};
		var css_resource = {};
		var resource_idx = 0;

		// Iterate over all specified file groups.
		this.files.forEach(function (f) {
			// Concat specified files.

			var src = f.src.filter(function (filepath) {
				if (grunt.file.isDir(filepath)) return false; // 디렉토리 걸러내기
				// Warn on and remove invalid source files (if nonull was set).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});

			//grunt.log.writeln(JSON.stringify(f));

			if (options.detect) {

				src.forEach(function (filepath) {

					var content = grunt.file.read(filepath),
						re_script = new RegExp('<script[^>]*>.*?</script>', 'g'),
						re_css = new RegExp('<link [^<>]*>', 'g');

					script_resource[filepath] = {
						src: [],
						dest: ""
					};

					css_resource[filepath] = {
						src: [],
						dest: ""
					};

					var tmp_resource = [], is_js_published = false, is_css_published = false;

					if (options.detect.js) {

						var content_matches = content.match(re_script) || [];

						content_matches.forEach(function (tag) {
							var matches = tag.match(/src=[\"\']([^\"\']*)[\"\']/), file_src = "";
							if (matches && matches.length > 1) {
								file_src = matches[1];

								if (tag.search('data-min=') == -1) {
									if (tag.search('data-min-disable=') == -1 && file_src.substring(0, 4) != "http" && file_src.substring(0, 2) != "//") {
										if(options.app_root){
											if(file_src.substring(0, 1) == "/")
												tmp_resource.push( options.app_root + file_src);
											else tmp_resource.push( options.app_root + "/" + file_src);
										}else {
											tmp_resource.push( filepath.substr(0, filepath.lastIndexOf('/')) + '/' + file_src );
										}
									} else {

									}
								} else {
									is_js_published = true;
								}
							}
						});
						if (!is_js_published) {
							// 스크립트 리소스 추가
							script_resource[filepath].src = [].concat(tmp_resource);
						}
						else {
							grunt.log.warn(' "' + filepath + '" is published js - js 배포 처리된 html 파일입니다.  ');
							delete script_resource[filepath];
						}

						// 목적파일 검사.
						if (!is_js_published) {
							var makeDest = true;
							for (var k in script_resource) {
								if (k != filepath) { // 현재 파일 제외
									// 리소스가 동일한 목적파일이 있는지 확인합니다.
									if (JSON.stringify(script_resource[k].src) == JSON.stringify(script_resource[filepath].src)) {
										script_resource[filepath].dest = script_resource[k].dest;
										makeDest = false;
									}
								}
							}
							if (makeDest) {
								var resource_name = "res_" + set_digit(resource_idx++, 3) + "." + get_time_serial() + ".js";
								// resource_name
								// f.resource_dest
								var resource_contents = "";

								var result;
								try {
									result = uglify.minify(script_resource[filepath].src, f.resource_dest + '/' + resource_name, options);
								} catch (e) {
									console.log(e);
									var err = new Error('Uglification failed.');
									if (e.message) {
										err.message += '\n' + e.message + '. \n';
										if (e.line) {
											err.message += 'Line ' + e.line + ' in ' + src + '\n';
										}
									}
									err.origError = e;
									grunt.log.warn('Uglifying source ' + chalk.cyan(src) + ' failed.');
									grunt.fail.warn(err);
								}

								// Concat minified source + footer
								var output = result.min + footer;

								// Only prepend banner if uglify hasn't taken care of it as part of the preamble
								if (!options.sourceMap) {
									output = banner + output;
								}

								// Write the destination file.
								grunt.file.write(f.resource_dest + '/' + resource_name, output);
								script_resource[filepath].dest = f.resource_dest_label + '/' + resource_name;
								grunt.log.writeln(' make file "' + script_resource[filepath].dest + '"  ');
							}
						}

						// script_resource[filepath].dest 로 script 태그 치환작업

						if (script_resource[filepath]) {
							var first_replace = true;
							content = content.replace(re_script, function (tag) {
								var matches = tag.match(/src=[\"\']([^\"\']*)[\"\']/), file_src = "";
								if (matches && matches.length > 1) {
									file_src = matches[1];
									if (tag.search('data-min=') == -1 && tag.search('data-min-disable=') == -1 && file_src.substring(0, 4) != "http" && file_src.substring(0, 2) != "//") {
										if (first_replace) {
											first_replace = false;
											return '<script type="text/javascript" src="' + script_resource[filepath].dest + '" data-min="true"></script>';
										} else {
											return '';
										}
									}else{
										return tag;
									}
								}
							});
							grunt.file.write(filepath, content);
							grunt.log.writeln(' replaced "' + filepath + '" for JS  ');
						}

					}

					if (options.detect.css) {
						content.match(re_css).forEach(function (tag) {
							var matches = tag.match(/href=[\"\']([^\"\']*)[\"\']/), file_src = "";
							if (matches.length > 1) {
								file_src = matches[1];

								if (tag.search('data-min=') == -1) {
									tmp_resource.push(filepath.substr(0, filepath.lastIndexOf('/')) + '/' + file_src);
								} else {
									is_css_published = true;
								}
							}
						});
						if (!is_css_published) {
							// 스크립트 리소스 추가
							css_resource[filepath].src = [].concat(tmp_resource);
						}
						else {
							grunt.log.warn(' "' + filepath + '" is published css - css 배포 처리된 html 파일입니다.  ');
							delete css_resource[filepath];
						}

						// 목적파일 검사.
						if (!is_css_published) {
							var makeDest = true;
							for (var k in css_resource) {
								if (k != filepath) { // 현재 파일 제외
									// 리소스가 동일한 목적파일이 있는지 확인합니다.
									if (JSON.stringify(css_resource[k].src) == JSON.stringify(css_resource[filepath].src)) {
										css_resource[filepath].dest = css_resource[k].dest;
										makeDest = false;
									}
								}
							}
							if (makeDest) {
								var resource_name = "res_" + set_digit(resource_idx++, 3) + "." + get_time_serial() + ".css";
								// resource_name
								// f.resource_dest
								var resource_contents = "";

								css_resource[filepath].src.forEach(function (fpath) {
									resource_contents += grunt.file.read(fpath) + "\n\n";
								});

								grunt.file.write(f.resource_dest + '/' + resource_name, resource_contents);
								css_resource[filepath].dest = f.resource_dest + '/' + resource_name;

								grunt.log.writeln(' make file "' + css_resource[filepath].dest + '"  ');
							}
						}

						// script_resource[filepath].dest 로 script 태그 치환작업

						if (css_resource[filepath]) {
							var first_replace = true;
							content = content.replace(re_css, function () {
								if (first_replace) {
									first_replace = false;
									return '<link rel="stylesheet" type="text/css" href="' + css_resource[filepath].dest + '" data-min="true" />';
								} else {
									return '';
								}
							});
							grunt.file.write(filepath, content);
							grunt.log.writeln(' replaced "' + filepath + '" for CSS ');
						}
					}

				});

				//grunt.log.writeln('File "' + f.dest + '" created.');
			}
		});
	});

};

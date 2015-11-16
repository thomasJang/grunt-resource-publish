# grunt-resource-publish

> The best Grunt plugin ever.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-resource-publish --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-resource-publish');
```

## The "resource_publish" task

### Overview
In your project's Gruntfile, add a section named `resource_publish` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
	resource_publish: {
		run: {
			options: {
				detect: {
					js: true,
					css: false
				},
				app_root: "절대경로를 사용하는 페이지인 경우."
			},
			files: [
				{
					src: 'test/target/**/*.html',
					resource_dest: "test/target/__",
					resource_dest_label: "/static/__" // replace로 표현할 경로 라벨
				}
			]
		}
	}
});
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">

	<link rel="stylesheet" type="text/css" href="css/app.css" />
	<script type="text/javascript" src="js/app.js"></script>
	<script type="text/javascript" src="js/app12.js"></script>

	<title></title>
</head>
<body>

</body>
</html>
```

#### run resource_publish

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">

	<link rel="stylesheet" type="text/css" href="css/app.css" />
	<script type="text/javascript" src="test/target/__/res_000.20150621191250.js" data-min="true"></script>
	

	<title></title>
</head>
<body>

</body>
</html>
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

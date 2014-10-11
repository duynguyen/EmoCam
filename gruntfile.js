module.exports = function(grunt) {

	grunt.initConfig({
	    pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['gruntfile.js', 'public/js/**/*.js'],
			options: {
				globals: {
					jQuery: true,
					console: true,
					module: true
				}
			}
		},
		sass: {
			dist: {
				options: {
					style: 'expanded',
					sourcemap: 'none'
				},
				files: [{
					expand: true,
					cwd: 'public/css/',
					src: ['*.scss'],
					dest: 'public/css',
					ext: '.css'
				}]
			}
		}
	});
	
	// grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	// grunt.loadNpmTasks('grunt-contrib-cssmin');
	// grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	// grunt.loadNpmTasks('grunt-karma');

	// js-related task
	// grunt.registerTask('js', [
	// 	'jshint'
	// ]);

	// one task to rule them all!
  	grunt.registerTask('default', [
  		'sass',
  		'jshint',
  	]);
};
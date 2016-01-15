(function() {
    module.exports = function(grunt) {
        var remapify = require('remapify');
        var coffeeify = require("coffeeify");
        var stringify = require("stringify");
        grunt.initConfig({
            clean: {
                bin: ["bin"],
            },
            browserify: {
                main: {
                    options: {
                        preBundleCB: function(b) {
                            b.transform(coffeeify)
                            b.transform(stringify({extensions: [".hbs", ".html", ".tpl", ".txt"]}))
                        }
                    },
                    expand: true,
                    flatten: true,
                    src: ['preventoverscroll.js'],
                    dest: 'bin',
                    ext: '.js'
                }
            },
            uglify: {
                main: {
                    files: {
                        'bin/preventoverscroll.min.js': ['bin/preventoverscroll.js']
                    }
                },
            },
            watch: {
                weixin: {
                  files: ["lib/*.js"],
                  tasks: ["browserify"]
                }
            },
            connect: {
                server: {
                    options: {
                        port: 8000,
                        base: '.'
                    }
                }
            }
        });

        grunt.loadNpmTasks("grunt-contrib-clean");
        grunt.loadNpmTasks("grunt-browserify");
        grunt.loadNpmTasks("grunt-contrib-watch");
        grunt.loadNpmTasks("grunt-contrib-uglify");
        grunt.loadNpmTasks('grunt-contrib-connect');

        grunt.registerTask("default", function() {
            return grunt.task.run([
                "clean",
                "browserify",
                "connect",
                "watch"]
            );
        });

        grunt.registerTask("release", function() {
            return grunt.task.run([
                "clean",
                "browserify",
                "uglify"
            ]);
        });
    };
}).call(this);

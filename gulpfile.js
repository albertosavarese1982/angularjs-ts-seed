'use strict';

var gulp = require('gulp');
var bump = require('gulp-bump');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var inject = require('gulp-inject');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var template = require('gulp-template');
var tslint = require("gulp-tslint");
var tsc = require('gulp-typescript');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

var Builder = require('systemjs-builder');
var del = require('del');
var fs = require('fs');
var join = require('path').join;
var karma = require('karma').server;
var runSequence = require('run-sequence');
var semver = require('semver');

var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');
var openResource = require('open');

// --------------
// Configuration.

var PATH = {
  dest: {
    all: 'dist',
    dev: {
      all: 'dist/dev',
      lib: 'dist/dev/lib'
    },
    prod: {
      all: 'dist/prod',
      lib: 'dist/prod/lib'
    }
  },
  src: {
    app: {
      all: ['./app/**/*.ts'],
      dev: ['./app/**/*.ts', '!./app/**/*.spec.ts'],
      test: ['./app/**/*.ts', '!./app/init.ts']
    },
    // Order is quite important here for the HTML tag injection.
    lib: [
      './node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.js',
      './node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.js.map',
      './node_modules/systemjs/dist/system.src.js',
      './node_modules/angular/angular.js',
      './node_modules/angular-new-router/dist/router.es5.js'
    ]
  }
};

var appProdBuilder = new Builder({
  baseURL: 'file:./tmp',
});

var HTMLMinifierOpts = { conditionals: true };

var tsProject = tsc.createProject('tsconfig.json', {
  typescript: require('typescript')
});

var semverReleases = ['major', 'premajor', 'minor', 'preminor', 'patch',
  'prepatch', 'prerelease'];

var port = 5555;

// --------------
// Clean.

gulp.task('clean', function(done) {
  del(PATH.dest.all, done);
});

gulp.task('clean.dev', function(done) {
  del(PATH.dest.dev.all, done);
});

gulp.task('clean.app.dev', function(done) {
  // TODO: rework this part.
  del([join(PATH.dest.dev.all, '**/*'), '!' +
    PATH.dest.dev.lib, '!' + join(PATH.dest.dev.lib, '*')], done);
});

gulp.task('clean.prod', function(done) {
  del(PATH.dest.prod.all, done);
});

gulp.task('clean.app.prod', function(done) {
  // TODO: rework this part.
  del([join(PATH.dest.prod.all, '**/*'), '!' +
    PATH.dest.prod.lib, '!' + join(PATH.dest.prod.lib, '*')], done);
});

gulp.task('clean.tmp', function(done) {
  del('tmp', done);
});

gulp.task('clean.test', function(done) {
  del('test', done);
});

// --------------
// Lint dev.

gulp.task("lint", function() {
  gulp.src(PATH.src.app.all)
    .pipe(tslint())
    .pipe(tslint.report("prose"), {
      emitError: false,
      reportLimit: 2,
      summarizeFailureOutput: true
    });
});

// --------------
// Build dev.

gulp.task('build.lib.dev', /*['build.ng2.dev'],*/ function() {
  return gulp.src(PATH.src.lib)
    .pipe(gulp.dest(PATH.dest.dev.lib));
});

gulp.task('build.js.dev', function() {
  var result = gulp.src(PATH.src.app.dev)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(tsc(tsProject));

  return result.js
    .pipe(sourcemaps.write())
    .pipe(template({ VERSION: getVersion() }))
    .pipe(gulp.dest(PATH.dest.dev.all));
});

gulp.task('build.assets.dev', ['build.js.dev'], function() {
  return gulp.src(['./app/**/*.html', './app/**/*.css'])
    .pipe(gulp.dest(PATH.dest.dev.all));
});

gulp.task('build.index.dev', function() {
  var target = gulp.src(injectableDevAssetsRef(), { read: false });
  return gulp.src('./app/index.html')
    .pipe(inject(target, { transform: transformPath('dev') }))
    .pipe(template({ VERSION: getVersion() }))
    .pipe(gulp.dest(PATH.dest.dev.all));
});

gulp.task('build.app.dev', function(done) {
  runSequence('clean.app.dev', 'build.assets.dev', 'build.index.dev', done);
});

gulp.task('build.dev', function(done) {
  runSequence('clean.dev', 'build.lib.dev', 'build.app.dev', done);
});

// --------------
// Build prod.

gulp.task('build.lib.prod', /*['build.ng2.prod'],*/ function() {
  var jsOnly = filter('**/*.js');

  return gulp.src(PATH.src.lib)
    .pipe(jsOnly)
    .pipe(sourcemaps.init())
    .pipe(concat('lib.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(PATH.dest.prod.lib));
});

gulp.task('build.js.tmp', function() {
  var result = gulp.src(['./app/**/*.ts', '!./app/init.ts',
    '!./app/**/*.spec.ts'])
    .pipe(plumber())
    .pipe(tsc(tsProject));

  return result.js
    .pipe(template({ VERSION: getVersion() }))
    .pipe(gulp.dest('tmp'));
});

// TODO: add inline source maps (System only generate separate source maps file).
gulp.task('build.js.prod', ['build.js.tmp'], function() {
  return appProdBuilder.build('app', join(PATH.dest.prod.all, 'app.js'),
    { minify: true }).catch(function(e) { console.log(e); });
});

gulp.task('build.init.prod', function() {
  var result = gulp.src('./app/init.ts')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(tsc(tsProject));

  return result.js
    .pipe(uglify())
    .pipe(template({ VERSION: getVersion() }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(PATH.dest.prod.all));
});

gulp.task('build.assets.prod', ['build.js.prod'], function() {
  var filterHTML = filter('**/*.html');
  var filterCSS = filter('**/*.css');
  return gulp.src(['./app/**/*.html', './app/**/*.css'])
    .pipe(filterHTML)
    .pipe(minifyHTML(HTMLMinifierOpts))
    .pipe(filterHTML.restore())
    .pipe(filterCSS)
    .pipe(minifyCSS())
    .pipe(filterCSS.restore())
    .pipe(gulp.dest(PATH.dest.prod.all));
});

gulp.task('build.index.prod', function() {
  var target = gulp.src([join(PATH.dest.prod.lib, 'lib.js'),
    join(PATH.dest.prod.all, '**/*.css')], { read: false });
  return gulp.src('./app/index.html')
    .pipe(inject(target, { transform: transformPath('prod') }))
    .pipe(template({ VERSION: getVersion() }))
    .pipe(gulp.dest(PATH.dest.prod.all));
});

gulp.task('build.app.prod', function(done) {
  // build.init.prod does not work as sub tasks dependencies so placed it here.
  runSequence('clean.app.prod', 'build.init.prod', 'build.assets.prod',
    'build.index.prod', 'clean.tmp', done);
});

gulp.task('build.prod', function(done) {
  runSequence('clean.prod', 'build.lib.prod', 'clean.tmp', 'build.app.prod',
    done);
});

// --------------
// Test.

gulp.task('build.test', ['clean.test'], function(done) {
  var result = gulp.src(PATH.src.app.test)
    .pipe(plumber())
    .pipe(tsc(tsProject));

  return result.js
    .pipe(gulp.dest('./test'));
});

gulp.task('run.karma', ['build.test'], function(done) {
  karma.start({
    configFile: join(__dirname, 'karma.conf.js'),
    singleRun: true
  }, done);
});

gulp.task('test', ['run.karma'], function() {
  watch('./app/**', function() {
    gulp.start('run.karma');
  });
});

// --------------
// Version.

registerBumpTasks();

gulp.task('bump.reset', function() {
  return gulp.src('package.json')
    .pipe(bump({ version: '0.0.0' }))
    .pipe(gulp.dest('./'));
});

// --------------
// Serve dev.

gulp.task('serve.dev', ['build.dev'], function() {
  var app;

  watch('./app/**', function() {
    gulp.start('build.app.dev');
  });

  app = connect().use(serveStatic(join(__dirname, PATH.dest.dev.all)));
  http.createServer(app).listen(port, function() {
    openResource('http://localhost:' + port);
  });
});

// --------------
// Serve prod.

gulp.task('serve.prod', ['build.prod'], function() {
  var app;

  watch('./app/**', function() {
    gulp.start('build.app.prod');
  });

  app = connect().use(serveStatic(join(__dirname, PATH.dest.prod.all)));
  http.createServer(app).listen(port, function() {
    openResource('http://localhost:' + port);
  });
});

// --------------
// Utils.

function transformPath(env) {
  var v = '?v=' + getVersion();
  return function(filepath) {
    arguments[0] = filepath.replace('/' + PATH.dest[env].all, '.') + v;
    return inject.transform.apply(inject.transform, arguments);
  };
}

function injectableDevAssetsRef() {
  var src = PATH.src.lib.map(function(path) {
    return join(PATH.dest.dev.lib, path.split('/').pop());
  });
  src.push(join(PATH.dest.dev.all, '**/*.css'));
  return src;
}

function getVersion() {
  var pkg = JSON.parse(fs.readFileSync('package.json'));
  return pkg.version;
}

function registerBumpTasks() {
  semverReleases.forEach(function(release) {
    var semverTaskName = 'semver.' + release;
    var bumpTaskName = 'bump.' + release;
    gulp.task(semverTaskName, function() {
      var version = semver.inc(getVersion(), release);
      return gulp.src('package.json')
        .pipe(bump({ version: version }))
        .pipe(gulp.dest('./'));
    });
    gulp.task(bumpTaskName, function(done) {
      runSequence(semverTaskName, 'build.app.prod', done);
    });
  });
}

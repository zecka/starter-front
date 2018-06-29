// Aide sur : https://la-cascade.io/gulp-pour-les-debutants/

var root_path = '../';
var build_path = root_path + 'build';
var devUrl = "http://localhost:8888/exam-front"
var paths = {
    images: {
        src: 'img/**',
        dest: build_path + '/img'
    },
    scripts: {
        src: {
            custom: 'js/custom/**/*.js',
            vendors: 'js/vendors/**/*.js',
        },
        dest: {
            custom: build_path + '/js/custom',
            vendors: build_path + '/js/vendors'
        }
    },
    styles: {
        src: 'scss/**/*.scss',
        dest: build_path + '/css'
    },
    fonts: {
        src: 'fonts/**/*.*',
        dest: build_path + '/fonts'
    },
    iconfont: {
        src: 'icons/**/*.*',
    }
    
};



// Cette déclaration indique à Node d'aller chcercher le package gulp et l'attribué à la variable gulp
var gulp = require('gulp');

// require browser-sync plugin
var browserSync = require('browser-sync').create();

// require gulp-sass plugin
var sass = require('gulp-sass')

// other require
const debug = require('gulp-debug');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const minify_css = require('gulp-uglifycss');
const minify_js = require('gulp-uglify');
const filesize = require('gulp-filesize');
const concat = require('gulp-concat');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');
const runSequence = require('run-sequence');
const imagemin = require('gulp-imagemin');
 


// Task qui dit hello, super pratique indisipensable dans chaque projet :)
gulp.task('hello', function(){
	console.log('Hello DAVID TU KIFF MON WORKFLOW GULP ?');
});

// gulp.src indique à la tache quel fichier utiliser
// gulp.dest indique ou placer les fichier résultant à l'éxécution d'une tâche


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// FONT ICON
var fontName = 'icons';
gulp.task('iconfont', function(){
  gulp.src(['icons/**/*.svg'])
    .pipe(iconfontCss({
      fontName: fontName,
      targetPath: '../../../dev/scss/fonts/_icons.scss',
      fontPath: '../fonts/icons/',
      cssClass: 'icon'
    }))
    .pipe(iconfont({
      fontName: fontName,
      formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],

     }))
    .pipe(gulp.dest('../build/fonts/icons'));
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Styles
gulp.task('sass', function(){
	return gulp.src(paths.styles.src) // Prend tous les fichier qui termine par scss dans le dossier scss (exepté ceux qui commence par "_" )
		.pipe(sass())	// ici on utilise gulp-sass
		.on('error', function (err) {
            console.log(err.toString()); // On affiche les erreur dans le terminal
            this.emit('end');
        })
		.pipe(gulp.dest(paths.styles.dest)) // On enregistrer dans le dossier build
		
		.pipe(filesize())
        .pipe(rename({ suffix: '.min' }))
        .pipe(minify_css())
        .pipe(gulp.dest(paths.styles.dest))
        
		.pipe(
			browserSync.reload({
				stream: true
			})
		)
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Fonts
gulp.task('fonts', function(){
	return gulp.src(paths.fonts.src)
	.pipe(gulp.dest(paths.fonts.dest))
	.pipe(
		browserSync.reload({
			stream: true
		})
	)
	.pipe(filesize())
	.pipe(debug({ 'title': 'custom fonts done' }))
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Images
gulp.task('images', function(){
	return gulp.src(paths.images.src)
	.pipe(gulp.dest(paths.images.dest))
	.pipe(
		browserSync.reload({
			stream: true
		})
	)
	.pipe(filesize())
	.pipe(debug({ 'title': 'custom images done' }))
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Imagemin
gulp.task('imagemin', () =>
	gulp.src(paths.images.src) // On selectionne les sources
		.pipe(imagemin()) // On les compresse
		.pipe(gulp.dest(paths.images.dest)) // on les enregistre
);
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Scripts

gulp.task('scripts', function() {
    return gulp.src(paths.scripts.src.custom)
        .pipe(gulp.dest(paths.scripts.dest.custom + '/custom_separated'))
        .on('error', function (err) {
            console.log(err.toString());
            this.emit('end');
        })
        .pipe(concat('main.js'))
        .pipe(gulp.dest(paths.scripts.dest.custom))
        .pipe(filesize())
        .pipe(rename({ suffix: '.min' }))
        .pipe(minify_js())
        .pipe(gulp.dest(paths.scripts.dest.custom))
        .pipe(
			browserSync.reload({
				stream: true
			})
		)
        .pipe(filesize())
        .pipe(debug({ 'title': 'custom scripts done' }))
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// JS Vendors
gulp.task('vendors', function() {
    return gulp.src(paths.scripts.src.vendors)
        .pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'Vendors Scripts',
                    message: err.message
                }
            })
        }))
        .pipe(gulp.dest(paths.scripts.dest.vendors + '/vendors_separated'))
        .pipe(concat('vendors.js'))
        .pipe(gulp.dest(paths.scripts.dest.vendors))
        .pipe(filesize())
        .pipe(rename({
            basename: 'vendors',
            suffix: '.min'
        }))
        .pipe(minify_js())
        .pipe(gulp.dest(paths.scripts.dest.vendors))
        .pipe(filesize())
        .pipe(debug({ 'title': 'vendors scripts done' }));

});



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// BrowserSync


gulp.task('browserSync', function(){
	browserSync.init({
		 proxy: devUrl
	});
});

gulp.task('php', browserSync.reload);
gulp.task('php', function(){
	return gulp.src('../../**/*.php')
	.on('error', function (err) {
        console.log(err.toString());
        this.emit('end');
    })
	.pipe(
		browserSync.reload({
			stream: true
		})
	)	
});  

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// RELOAD

gulp.task('reload', browserSync.reload); // TACHES QUI RELOAD


// Task permettant de suivre des fichier et executer une autre task à chaque fois que ceux-ci sont modifié
gulp.task('watch',['browserSync', 'sass'], function(){	// Surveille tous les fichier dans le dossier scss terminant par .scss
	
	gulp.watch(paths.styles.src, ['sass']);
	
	gulp.watch(paths.fonts.src, ['fonts']);
	gulp.watch(paths.iconfont.src, ['iconfont', 'sass']);

	gulp.watch("../../**/*.html", ['reload']); 
	gulp.watch(paths.images.src, ['imagemin']);
	
	gulp.watch(paths.scripts.src.custom, ['scripts']); 

});



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Build
gulp.task('build', function(done) {
    runSequence('fonts', 'scripts', 'iconfont', 'sass', 'vendors', 'imagemin', function() {
        console.log('Run something else');
        done();
    });
});




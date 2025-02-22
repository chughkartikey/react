import { task, src, dest, lastRun, parallel, series, watch } from 'gulp'
import cache from 'gulp-cache'
import remember from 'gulp-remember'
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import webpack from 'webpack'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'

import sh from '../sh'
import config from '../../../config'
import gulpComponentMenu from '../plugins/gulp-component-menu'
import gulpComponentMenuBehaviors from '../plugins/gulp-component-menu-behaviors'
import gulpDoctoc from '../plugins/gulp-doctoc'
import gulpExampleMenu from '../plugins/gulp-example-menu'
import gulpExampleSource from '../plugins/gulp-example-source'
import gulpReactDocgen from '../plugins/gulp-react-docgen'
import { getRelativePathToSourceFile } from '../plugins/util'
import webpackPlugin from '../plugins/gulp-webpack'
import { Server } from 'http'
import serve, { forceClose } from '../serve'
import OpenBrowserPlugin from '../plugins/webpack-open-browser'

const { paths } = config
const g = require('gulp-load-plugins')()

const { log } = g.util

const handleWatchChange = changedPath => log(`File ${changedPath} was changed, running tasks...`)
const handleWatchUnlink = (group, changedPath) => {
  log(`File ${changedPath} was deleted, running tasks...`)
  remember.forget(group, changedPath)
}

// ----------------------------------------
// Clean
// ----------------------------------------

task('clean:cache', () => cache.clearAll())

task('clean:docs:component-menu', cb => {
  rimraf(paths.docsSrc('componentMenu.json'), cb)
})

task('clean:docs:component-menu-behaviors', cb => {
  rimraf(paths.docsSrc('behaviorMenu.json'), cb)
})

task('clean:docs:dist', cb => {
  rimraf(paths.docsDist(), cb)
})

task('clean:docs:example-menus', cb => {
  rimraf(paths.docsSrc('exampleMenus'), cb)
})

task('clean:docs:example-sources', cb => {
  rimraf(paths.docsSrc('exampleSources'), cb)
})

task(
  'clean:docs',
  parallel(
    'clean:docs:component-menu',
    'clean:docs:component-menu-behaviors',
    'clean:docs:dist',
    'clean:docs:example-menus',
    'clean:docs:example-sources',
  ),
)

// ----------------------------------------
// Build
// ----------------------------------------

const componentsSrc = [
  `${paths.posix.packageSrc('react')}/components/*/[A-Z]*.tsx`,
  `${paths.posix.packageSrc('react-component-ref')}/src/[A-Z]*.tsx`,
  `${paths.posix.packageSrc('react')}/lib/accessibility/FocusZone/[A-Z]!(*.types).tsx`,
]
const behaviorSrc = [`${paths.posix.packageSrc('react')}/lib/accessibility/Behaviors/*/[a-z]*.ts`]
const examplesIndexSrc = `${paths.posix.docsSrc()}/examples/*/*/*/index.tsx`
const examplesSrc = `${paths.posix.docsSrc()}/examples/*/*/*/!(*index|.knobs).tsx`
const markdownSrc = [
  '.github/CONTRIBUTING.md',
  '.github/setup-local-development.md',
  '.github/add-a-feature.md',
  '.github/document-a-feature.md',
  '.github/test-a-feature.md',
  'specifications/*.md',
]

task('build:docs:component-info', () =>
  src(componentsSrc, { since: lastRun('build:docs:component-info') })
    .pipe(cache(gulpReactDocgen(['DOMAttributes', 'HTMLAttributes']), { name: 'componentInfo-1' }))
    .pipe(dest(paths.docsSrc('componentInfo'))),
)

task('build:docs:component-menu', () =>
  src(componentsSrc, { since: lastRun('build:docs:component-menu') })
    .pipe(gulpComponentMenu())
    .pipe(dest(paths.docsSrc())),
)

task('build:docs:component-menu-behaviors', () =>
  src(behaviorSrc, { since: lastRun('build:docs:component-menu-behaviors') })
    .pipe(remember('component-menu-behaviors'))
    .pipe(gulpComponentMenuBehaviors())
    .pipe(dest(paths.docsSrc())),
)

task('build:docs:example-menu', () =>
  src(examplesIndexSrc, { since: lastRun('build:docs:example-menu') })
    .pipe(remember('example-menu')) // FIXME: with watch this unnecessarily processes index files for all examples
    .pipe(gulpExampleMenu())
    .pipe(dest(paths.docsSrc('exampleMenus'))),
)

task('build:docs:example-sources', () =>
  src(examplesSrc, { since: lastRun('build:docs:example-sources') })
    .pipe(
      cache(gulpExampleSource(), {
        name: 'exampleSources',
      }),
    )
    .pipe(dest(paths.docsSrc('exampleSources'))),
)

task(
  'build:docs:json',
  parallel(
    series('build:docs:component-info', 'build:docs:component-menu'),
    'build:docs:component-menu-behaviors',
    'build:docs:example-menu',
    'build:docs:example-sources',
  ),
)

task('build:docs:html', () => src(paths.docsSrc('404.html')).pipe(dest(paths.docsDist())))

task('build:docs:images', () =>
  src(`${paths.docsSrc()}/**/*.{png,jpg,gif}`).pipe(dest(paths.docsDist())),
)

task('build:docs:toc', () =>
  src(markdownSrc, { since: lastRun('build:docs:toc') }).pipe(
    cache(gulpDoctoc(), {
      name: 'md-docs',
    }),
  ),
)

task('build:docs:webpack', cb => {
  webpackPlugin(require('../../webpack.config').default, cb)
})

task(
  'build:docs:assets',
  parallel(
    'build:docs:toc',
    series('clean:docs', parallel('build:docs:json', 'build:docs:html', 'build:docs:images')),
  ),
)

task('build:docs', series('build:docs:assets', 'build:docs:webpack'))

// ----------------------------------------
// Deploy
// ----------------------------------------

task('deploy:docs', cb => {
  const relativePath = path.relative(process.cwd(), paths.docsDist())
  return sh(`gh-pages -d ${relativePath} -m "deploy docs [ci skip]"`)
})

// ----------------------------------------
// Serve
// ----------------------------------------

let server: Server
task('serve:docs', async () => {
  const webpackConfig = require('../../webpack.config').default

  webpackConfig.plugins.push(
    new OpenBrowserPlugin({
      host: config.server_host,
      port: config.server_port,
    }),
  )
  const compiler = webpack(webpackConfig)

  server = await serve(paths.docsDist(), config.server_host, config.server_port, app =>
    app
      .use(
        WebpackDevMiddleware(compiler, {
          publicPath: webpackConfig.output.publicPath,
          contentBase: paths.docsSrc(),
          hot: true,
          quiet: false,
          noInfo: true, // must be quite for hot middleware to show overlay
          lazy: false,
          stats: config.compiler_stats,
        }),
      )
      .use(WebpackHotMiddleware(compiler)),
  )
})

task('serve:docs:stop', () => forceClose(server))

// ----------------------------------------
// Watch
// ----------------------------------------

task('watch:docs', cb => {
  // rebuild component info
  watch(componentsSrc, series('build:docs:component-info')).on('change', handleWatchChange)

  // rebuild example menus
  watch(examplesIndexSrc, series('build:docs:example-menu'))
    .on('change', handleWatchChange)
    .on('unlink', changedPath => handleWatchUnlink('example-menu', changedPath))

  watch(examplesSrc, series('build:docs:example-sources'))
    .on('change', handleWatchChange)
    .on('unlink', filePath => {
      log(`File ${filePath} was deleted, running tasks...`)

      const sourceFilename = getRelativePathToSourceFile(filePath)
      const sourcePath = config.paths.docsSrc('exampleSources', sourceFilename)

      try {
        fs.unlinkSync(sourcePath)
      } catch (e) {}
    })

  watch(behaviorSrc, series('build:docs:component-menu-behaviors'))
    .on('change', handleWatchChange)
    .on('unlink', changedPath => handleWatchUnlink('component-menu-behaviors', changedPath))

  // rebuild images
  watch(`${config.paths.docsSrc()}/**/*.{png,jpg,gif}`, series('build:docs:images')).on(
    'change',
    handleWatchChange,
  )
  cb()
})

// ----------------------------------------
// Default
// ----------------------------------------

task('docs', series('build:docs:assets', 'serve:docs', 'watch:docs'))

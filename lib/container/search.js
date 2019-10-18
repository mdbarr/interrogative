'use strict';

const fs = require('fs');
const glob = require('glob');
const async = require('async');
const errors = require('restify-errors');

function Search (container) {
  this.go = (req, res, next) => {
    container.beat();

    const pattern = req.body.pattern;
    const regexp = this.toRegExp(pattern);

    return glob('**/*', {
      absolute: true,
      cwd: process.env.HOME,
      dot: true,
      ignore: [ '**/.interrogative/**', '**/.git/**', '**/node_modules/**' ],
      objectMode: true,
      nodir: true
    }, (error, files) => {
      if (error) {
        return next(new errors.InternalServerError('Search failed'));
      }

      return async.filter(files, (path, step) => {
        return fs.readFile(path, (err, data) => {
          if (err) {
            return step(null, false);
          }

          if (container.files.isBinary(data)) {
            return step(null, false);
          }

          data = data.toString();
          if (regexp) {
            return step(null, regexp.test(data));
          }
          return step(null, data.includes(pattern));
        });
      }, (err, matches) => {
        if (err) {
          return next(new errors.InternalServerError('Search failed'));
        }

        const results = matches.map((item) => {
          const result = {
            path: item,
            type: 'file'
          };

          result.name = item.replace(/^.*\/([^/]+)$/, '$1');
          result.extension = result.name.replace(/^.*\.([^.]+)$/, '$1');
          container.files.setAttributes(result);

          return result;
        });

        res.send(200, results);
        return next();
      });
    });
  };
}

Search.prototype.toRegExp = function(pattern, ignoreCase = true) {
  let regexp = pattern;
  let options = ignoreCase ? 'i' : '';

  if (pattern.startsWith('/')) {
    const parts = pattern.split('/');

    if (parts.length > 1) {
      regexp = parts[1];
      options = options + parts[2];
    }
  }

  try {
    regexp = new RegExp(regexp, options);
  } catch (error) {
    regexp = false;
  }

  return regexp;
};

module.exports = function(container, options) {
  return new Search(container, options);
};

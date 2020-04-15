import mime from 'mime';

export default {
  elementVisible (element, delay = 250) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        try {
          const style = window.getComputedStyle(element);
          const width = parseInt(style.getPropertyValue('width'), 10);
          const height = parseInt(style.getPropertyValue('height'), 10);

          const bounds = element.getBoundingClientRect();

          // console.log('visibility check', width, height, bounds.width, bounds.height);

          if (width > 0 && height > 0 && bounds.width > 0 && bounds.height > 0) {
            clearInterval(interval);
            resolve(true);
          }
        } catch (error) {
          // try again
        }
      }, delay);
    });
  },
  fontLoaded (name, delay = 250) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        try {
          if (document.fonts.check(`1em ${ name }`)) {
            clearInterval(interval);
            resolve(true);
          }
        } catch (error) {
          // try again
        }
      }, delay);
    });
  },
  fontsReady () {
    return document.fonts.ready;
  },
  setAttributes (item) {
    item.mime = mime.getType(item.extension) || 'text/plain';
    item.color = 'white';
    item.icon = 'file';

    if (item.name === 'Dockerfile') { // names
      item.mime = 'text/x-dockerfile';
      item.color = '#3A8CB4';
      item.icon = 'docker';
    } else if (item.name === 'CMakeLists.txt') {
      item.mime = 'text/x-cmake';
      item.color = '#649AD2';
      item.icon = 'language-c';
    } else if (item.name === 'package.json') {
      item.mime = 'application/json';
      item.color = '#F53E44';
      item.icon = 'npm-variant-outline';
    } else if (item.name === 'yarn.lock') {
      item.mime = 'text/plain';
      item.color = '#89BB5A';
      item.icon = 'nodejs';
    } else if (item.name === '.browserslistrc') {
      item.mime = 'text/plain';
      item.icon = 'web-box';
    } else if (item.name === '.editorconfig') {
      item.mime = 'text/plain';
      item.icon = 'pencil-box';
    } else if (item.name === '.gitignore') {
      item.mime = 'text/plain';
      item.color = '#F54D27';
      item.icon = 'git';
    } else if (item.name.startsWith('.bash')) {
      item.mime = 'text/x-sh';
      item.icon = 'file-code';
    } else if (item.extension === 'c' || item.extension === 'h') { // extensions
      item.mime = 'text/x-csrc';
      item.icon = 'language-c';
      item.color = '#649AD2';
    } else if (item.extension === 'cpp' || item.extension === 'hpp') {
      item.mime = 'text/x-csrc';
      item.icon = 'language-cpp';
      item.color = '#649AD2';
    } else if (item.extension === 'css') {
      item.mime = 'text/x-css';
      item.color = '#2673BA';
      item.icon = 'language-css3';
    } else if (item.extension === 'diff' || item.extension === 'patch') {
      item.mime = 'text/x-diff';
      item.icon = 'vector-difference';
    } else if (item.extension === 'groovy') {
      item.mime = 'text/x-groovy';
      item.color = '#5382A1';
      item.icon = 'language-java';
    } else if (item.extension === 'hs' || item.extension === 'lhs') {
      item.mime = 'text/x-haskell';
      item.color = '#649AD2';
      item.icon = 'language-haskell';
    } else if (item.extension === 'html' || item.extension === 'htm') {
      item.mime = 'text/html';
      item.color = '#E44D26';
      item.icon = 'language-html5';
    } else if ([ 'dmg', 'hddimg', 'img', 'iso', 'pkg' ].includes(item.extension)) {
      item.icon = 'folder-zip';
    } else if (item.extension === 'java') {
      item.mime = 'text/x-java';
      item.color = '#5382A1';
      item.icon = 'language-java';
    } else if (item.extension === 'js') {
      item.mime = 'text/javascript';
      item.color = '#F0DB4F';
      item.icon = 'language-javascript';
    } else if (item.extension === 'json') {
      item.mime = 'application/json';
      item.icon = 'code-json';
    } else if (item.extension === 'md') {
      item.mime = 'text/x-markdown';
      item.color = '#3598DA';
      item.icon = 'language-markdown';
    } else if (item.extension === 'pdf') {
      item.color = '#DB1B23';
      item.icon = 'file-pdf';
    } else if (item.extension === 'pl' || item.extension === 'pm') {
      item.mime = 'text/x-perl';
      item.icon = 'file-code';
    } else if (item.extension === 'php') {
      item.mime = 'text/x-php';
      item.icon = 'language-php';
    } else if (item.extension === 'py') {
      item.mime = 'text/x-python';
      item.color = '#3674A5';
      item.icon = 'language-python';
    } else if (item.extension === 'rst') {
      item.mime = 'text/x-rst';
      item.icon = 'file-document';
    } else if (item.extension === 'rb') {
      item.mime = 'text/x-ruby';
    } else if (item.extension === 'sc' || item.extension === 'scala') {
      item.mime = 'text/x-scala';
      item.icon = 'file-code';
    } else if (item.extension === 'scss') {
      item.mime = 'text/x-scss';
      item.color = '#2673BA';
      item.icon = 'language-css3';
    } else if (item.extension === 'sh' || item.extension === 'bash') {
      item.mime = 'text/x-sh';
      item.icon = 'file-code';
    } else if (item.extension === 'stl') {
      item.icon = 'cube-scan';
    } else if (item.extension === 'svg') {
      item.icon = 'svg';
    } else if (item.extension === 'ts') {
      item.mime = 'text/typescript';
      item.color = '#2A7ACC';
      item.icon = 'language-typescript';
    } else if (item.extension === 'vue') {
      item.mime = 'text/x-vue';
      item.color = '#41B883';
      item.icon = 'vuejs';
    } else if (item.extenision === 'yml' || item.extension === 'yaml') {
      item.mime = 'text/x-yaml';
      item.icon = 'file-code';
    } else if (item.extension === 'xml') {
      item.mime = 'application/xml';
      item.icon = 'file-code';
    } else if (item.extension === 'gif') {
      item.icon = 'gif';
    } else if ([ 'bmp', 'gif', 'ico', 'jpeg', 'jpg', 'png' ].includes(item.extension)) {
      item.icon = 'file-image';
    } else if ([ 'eot', 'otf', 'ttf', 'woff', 'woff2' ].includes(item.extension)) {
      item.icon = 'format-font';
    }

    if (item.name.includes('eslint')) { // special cases
      item.color = '#8080F2';
      item.icon = 'eslint';
    } else if (item.name.endsWith('.js.map')) {
      item.mime = 'text/javascript';
      item.color = '#F0DB4F';
      item.icon = 'language-javascript';
    }

    item.icon = `mdi-${ item.icon }`;
  },
};

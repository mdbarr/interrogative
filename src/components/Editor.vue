<template>
<div class="interrogative-editor-container" ref="container">
  <div ref="editor" v-show="editor">
    <textarea ref="textarea" :placeholder="placeholder"></textarea>
  </div>
  <div ref="image" v-show="image" class="image-preview"></div>
  <div id="interrogative-editor-panel" class="interrogative-editor-panel">
    <div class="interrogative-editor-panel-left">
      <i :class="lintedIcon"></i>
      <i class="mdi mdi-auto-fix interrogative-editor-clickable interrogative-editor-spacer-left" v-if="fixable" @click.stop="fix"></i>
    </div>
    <div class="interrogative-editor-panel-center">
      <i class="mdi mdi-drag-horizontal interrogative-editor-clickable" @click.stop="fix"></i>
    </div>
    <div class="interrogative-editor-panel-right">
      <i :class="fullscreenIcon" @click.stop="toggleFullscreen"></i>
    </div>
  </div>
</div>
</template>

<script>
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/lib/codemirror.css';
// Addons
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/comment/continuecomment';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/display/fullscreen.css';
import 'codemirror/addon/display/fullscreen';
import 'codemirror/addon/display/panel';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/trailingspace';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/merge/merge.css';
import 'codemirror/addon/merge/merge';
import 'codemirror/addon/mode/overlay';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/search/matchesonscrollbar.css';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/selection/mark-selection';
// Keymap
import 'codemirror/keymap/emacs';
import 'codemirror/keymap/sublime';
import 'codemirror/keymap/vim';
// Modes
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/cmake/cmake';
import 'codemirror/mode/css/css';
import 'codemirror/mode/diff/diff';
import 'codemirror/mode/dockerfile/dockerfile';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/haskell/haskell';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/lua/lua';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/perl/perl';
import 'codemirror/mode/php/php';
import 'codemirror/mode/python/python';
import 'codemirror/mode/rst/rst';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/vue/vue';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/xml/xml';

// Icons
import '@mdi/font/css/materialdesignicons.css';
// Theme
import 'codemirror/theme/lesser-dark.css';

import state from '../state';

export default {
  name: 'editor',
  props: {
    code: String,
    placeholder: {
      type: String,
      default: ''
    },
    value: String
  },
  computed: {
    fullscreenIcon () {
      let icon = 'interrogative-editor-clickable mdi mdi-fullscreen';
      if (this.fullscreen) {
        icon += '-exit';
      }
      return icon;
    },
    lintedIcon () {
      if (this.linted === true) {
        return 'mdi mdi-check-circle-outline';
      } else if (this.linted === false) {
        return 'mdi mdi-alert-circle-outline';
      }
      return 'mdi mdi-dots-horizontal-circle-outline';
    }
  },
  data () {
    return {
      state,

      focus: -1,
      file: null,

      editor: true,
      image: false,

      width: 0,
      height: 0,

      cursors: {},

      nodes: {},

      clean: true,
      content: '',
      fixable: false,
      fullscreen: false,
      instance: null,
      linted: null,
      panel: null
    };
  },
  methods: {
    setFocus (index) {
      const path = Object.keys(state.files)[index];
      this.file = this.state.files[path];

      console.log(this.file);

      this.focus = index;
      if (!this.file.binary) {
        this.instance.setOption('mode', this.file.mime);
        this.instance.setValue(this.file.contents);
        this.editor = true;
      } else if (this.file.mime.startsWith('image')) {
        this.editor = false;
        this.image = true;

        const data = this.file.contents;
        const bytes = new Uint8Array(data.length / 2);

        for (let i = 0; i < data.length; i += 2) {
          bytes[i / 2] = parseInt(data.substring(i, i + 2), /* base = */ 16);
        }
        const blob = new Blob([ bytes ], { type: this.file.mime });

        const image = new Image();
        image.src = URL.createObjectURL(blob);

        while (this.$refs.image.hasChildNodes()) {
          this.$refs.image.removeChild(this.$refs.image.firstChild);
        }
        image.style.width = `${ this.width }px`;
        image.style.height = `${ this.height }px`;
        image.style.objectFit = 'scale-down';

        this.$refs.image.appendChild(image);
      }
    },
    getCursor (user, coords) {
      if (!this.cursors[user]) {
        const element = this.nodes.element.cloneNode();
        const flag = this.nodes.flag.cloneNode();
        flag.innerHTML = user;
        element.appendChild(flag);

        this.cursors[user] = {
          user,
          element,
          flag,
          position: null,
          marker: null
        };
      }
      return this.cursors[user];
    },
    fix () {
      const cursor = this.instance.getCursor();
      const content = this.instance.getValue();
      // const result = linter.verifyAndFix(content, eslintConfig);
      this.instance.setValue(content); // result.output);
      this.instance.setCursor(cursor);
      this.instance.focus();
    },
    toggleFullscreen () {
      this.fullscreen = !this.instance.getOption('fullScreen');
      this.instance.setOption('fullScreen', this.fullscreen);
      this.panel.classList.toggle('interrogative-editor-panel-fullscreen');
      this.instance.focus();
    },
    resize () {
      this.width = this.app.clientWidth - 45;
      this.height = this.app.clientHeight - 484;

      this.$refs.container.style.width = `${ this.width }px`;
      this.$refs.container.style.height = `${ this.height }px`;

      this.instance.setSize(this.width, this.height);
    }
  },
  mounted () {
    // Cursor template elements
    this.nodes.element = document.createElement('span');
    this.nodes.element.style.borderLeftColor = '#2C87AF';
    this.nodes.element.style.borderLeftStyle = 'solid';
    this.nodes.element.style.borderLeftWidth = '2px';
    this.nodes.element.style.height = '14px';
    this.nodes.element.style.padding = 0;
    this.nodes.element.style.zIndex = 0;

    this.nodes.flag = document.createElement('div');
    this.nodes.flag.style.backgroundColor = '#2C87AF';
    this.nodes.flag.style.borderRadius = '3px 3px 3px 0px';
    this.nodes.flag.style.fontSize = '12px';
    this.nodes.flag.style.fontWeight = 700;
    this.nodes.flag.style.height = '11px';
    this.nodes.flag.style.lineHeight = '11px';
    this.nodes.flag.style.padding = '2px 4px';
    this.nodes.flag.style.position = 'absolute';
    this.nodes.flag.style.textTransform = 'uppercase';
    this.nodes.flag.style.top = '-14px';
    this.nodes.flag.style.zIndex = 100;

    //////////

    const vm = this;
    const events = [
      'beforeChange',
      'beforeSelectionChange',
      'blur',
      'changes',
      'cursorActivity',
      'electricInput',
      'focus',
      'gutterClick',
      'gutterContextMenu',
      'keyHandled',
      'optionChange',
      'refresh',
      'scroll',
      'scrollCursorIntoView',
      'update',
      'viewportChange'
    ];

    this.instance = CodeMirror.fromTextArea(this.$refs.textarea, {
      autoCloseBrackets: true,
      autoCloseTags: true,
      foldGutter: true,
      gutters: [
        'CodeMirror-lint-markers',
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter'
      ],
      keyMap: 'emacs',
      lineNumbers: true,
      lineWrapping: true,
      lint: true,
      matchBrackets: true,
      matchTags: true,
      mode: 'javascript',
      scrollbarStyle: 'overlay',
      showMatchesOnScrollbar: true,
      showTrailingSpace: true,
      smartIndent: true,
      styleActiveLine: true,
      tabSize: 2,
      theme: 'lesser-dark'
    });

    this.instance.vue = this;
    this.instance.setValue(this.code || this.value || this.content);

    this.app = document.getElementById('app');
    window.addEventListener('resize', this.resize);

    this.instance.on('cursorActivity', (document) => {
      this.$events.emit({
        type: 'editor:cursor:activity',
        data: {
          position: document.getCursor(),
          user: this.state.user
        }
      });
    });

    this.instance.on('change', (document, change) => {
      this.content = this.instance.getValue();
      this.$emit('input', this.content);

      if (!(change.origin && change.origin.endsWith('-event'))) {
        this.$events.emit({
          type: 'editor:document:change',
          data: {
            change,
            content: document.getValue(),
            user: this.state.user
          }
        });
      }
    });

    for (const event of events) {
      vm.instance.on(event, (...args) => {
        const eventName = event.replace(/([A-Z])/g, '-$1').toLowerCase();
        vm.$emit(eventName, ...args);
      });
    }

    this.panel = document.getElementById('interrogative-editor-panel');

    this.instance.addPanel(this.panel, {
      position: 'bottom',
      stable: true
    });

    this.resize();

    //////////

    this.$events.on('editor:tab:focus', (event) => {
      const index = event.data.tab;
      if (index >= 0 && index !== this.focus) {
        this.setFocus(index);
      }
      console.log(event);
    });

    this.$events.on('editor:cursor:activity', (event) => {
      console.log('cursor', event);
      if (event.data.user !== this.state.user) {
        const cursor = this.getCursor(event.data.user);
        cursor.position = event.data.position;
        if (cursor.marker) {
          cursor.marker.clear();
        }
        cursor.marker = this.instance.setBookmark(cursor.position, { widget: cursor.element });
        cursor.flag.style.left = `${ cursor.element.offsetLeft }px`;

        console.log('marker', cursor.marker);
      }
    });

    this.$events.on('editor:document:change', (event) => {
      console.log('change', event);
      if (event.data.user !== this.state.user) {
        const change = event.data.change;
        change.origin = `${ change.origin }-event`;

        this.instance.replaceRange(change.text, change.from, change.to, change.origin);
      }
    });
  },
  destroyed () {
    window.removeEventListener('resize', this.resize);
  }
};
</script>

<style>
.interrogative-editor {
    height: 100%;
    width: 100%;
}
.interrogative-editor-clickable {
    cursor: pointer;
}
.interrogative-editor-clickable:hover {
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.2) !important;
}
.interrogative-editor-panel {
    position: relative;
    box-sizing: border-box;
    background-color: #595959;
    height: 20px;
    width: 100%;
    padding-top: 0px;
    font-size: 16px;
    line-height: 20px;
    padding-left: 5px;
}
.interrogative-editor-panel-fullscreen {
    position: fixed;
    z-index: 10;
    bottom: 0;
    left: 0;
    border-radius: 0 !important;
}
.interrogative-editor-panel-left {
    display: inline-block;
    box-sizing: border-box;
    width: 33%;
    text-align: left;
    padding-left: 4px;
}
.interrogative-editor-panel-center {
    display: inline-block;
    box-sizing: border-box;
    width: 33%;
    text-align: center;
}
.interrogative-editor-panel-right {
    display: inline-block;
    box-sizing: border-box;
    width: 34%;
    text-align: right;
    padding-right: 4px;
}
.interrogative-editor-spacer-left {
    padding-left: 8px;
}
.CodeMirror {
    font-size: 14px;
}
.CodeMirror-fullscreen {
    margin-bottom: 24px;
}
.image-preview {
    overflow: hidden;
    background-color: #222;
}
</style>

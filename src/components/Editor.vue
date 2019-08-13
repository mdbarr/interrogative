<template>
<div class="vue-codemirror-js-editor">
    <textarea ref="textarea" :placeholder="placeholder"></textarea>
    <div id="vue-codemirror-js-panel" class="vue-codemirror-js-panel">
      <div class="vue-codemirror-js-panel-left">
        <i :class="lintedIcon"></i>
        <i class="mdi mdi-auto-fix vue-codemirror-js-clickable vue-codemirror-js-spacer-left" v-if="fixable" @click.stop="fix"></i>
      </div>
      <div class="vue-codemirror-js-panel-center">
        <i class="mdi mdi-drag-horizontal vue-codemirror-js-clickable" @click.stop="fix"></i>
      </div>
      <div class="vue-codemirror-js-panel-right">
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
// Mode
import 'codemirror/mode/javascript/javascript';
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
      let icon = 'vue-codemirror-js-clickable mdi mdi-fullscreen';
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
      this.instance.setValue(this.file.contents);
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
      this.panel.classList.toggle('vue-codemirror-js-panel-fullscreen');
      this.instance.focus();
    },
    resize () {
      const width = this.app.clientWidth - 45;
      const height = this.app.clientHeight - 484;

      console.log('editor', width, 'x', height);

      this.instance.setSize(width, height);
    }
  },
  mounted () {
    this.$events.on('editor:tab:focus', (event) => {
      const index = event.data;
      if (index >= 0 && index !== this.focus) {
        this.setFocus(index);
      }
      console.log(event);
    });

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

    this.instance.on('change', () => {
      this.content = this.instance.getValue();
      this.$emit('input', this.content);
    });

    for (const event of events) {
      vm.instance.on(event, (...args) => {
        const eventName = event.replace(/([A-Z])/g, '-$1').toLowerCase();
        vm.$emit(eventName, ...args);
      });
    }

    this.panel = document.getElementById('vue-codemirror-js-panel');

    this.instance.addPanel(this.panel, {
      position: 'bottom',
      stable: true
    });

    this.resize();
  },
  destroyed () {
    window.removeEventListener('resize', this.resize);
  }
};
</script>

<style>
.vue-codemirror-js {
    height: 100%;
    width: 100%;
}
.vue-codemirror-js-clickable {
    cursor: pointer;
}
.vue-codemirror-js-clickable:hover {
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.2) !important;
}
.vue-codemirror-js-panel {
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
.vue-codemirror-js-panel-fullscreen {
    position: fixed;
    z-index: 10;
    bottom: 0;
    left: 0;
    border-radius: 0 !important;
}
.vue-codemirror-js-panel-left {
    display: inline-block;
    box-sizing: border-box;
    width: 33%;
    text-align: left;
    padding-left: 4px;
}
.vue-codemirror-js-panel-center {
    display: inline-block;
    box-sizing: border-box;
    width: 33%;
    text-align: center;
}
.vue-codemirror-js-panel-right {
    display: inline-block;
    box-sizing: border-box;
    width: 34%;
    text-align: right;
    padding-right: 4px;
}
.vue-codemirror-js-spacer-left {
    padding-left: 8px;
}
.CodeMirror {
    font-size: 14px;
}
.CodeMirror-fullscreen {
    margin-bottom: 24px;
}
</style>

<template>
  <div
    ref="container"
    class="interrogative-editor-container"
  >
    <div
      v-show="mode === 'editor'"
      ref="editor"
    >
      <textarea ref="textarea" />
    </div>
    <div
      v-show="mode === 'image'"
      ref="image"
      class="image-preview"
    />
    <div
      v-show="mode === 'hexdump'"
      class="hexdump"
    >
      <pre
        ref="hexdump"
        class="hexdump-pre"
      />
    </div>
    <div
      v-show="mode === 'stl'"
      ref="stl"
    >
      <model-stl
        v-if="blob"
        :key="width"
        :src="blob"
        :width="width"
        :height="height"
        :lights="lights"
        background-color="#222"
      />
    </div>
    <div
      id="interrogative-editor-panel"
      class="interrogative-editor-panel"
    >
      <v-btn
        x-small
        tile
        height="20"
        color="#595959"
        elevation="0"
        @click.stop="toggleFullscreen"
      >
        <v-icon
          small
          class="bump pr-2"
        >
          {{ fullscreenIcon }}
        </v-icon> {{ fullscreenText }}
      </v-btn>
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

// Themes
import './code-mirror-themes.css';

// STL
import { ModelStl } from 'vue-3d-model';

import state from '../state';

export default {
  name: 'Editor',
  components: { ModelStl },
  data () {
    return {
      state,

      focus: null,
      file: null,

      mode: 'editor',

      blob: '',
      lights: [ {
        type: 'AmbientLight',
        color: 0xffffff,
        intensity: 0.5,
      }, {
        type: 'DirectionalLight',
        position: {
          x: 1, y: 1, z: 1,
        },
        color: 0xffffff,
        intensity: 0.2,
      } ],

      width: 0,
      height: 0,

      cursors: {},

      nodes: {},

      hasSelection: false,

      clean: true,
      content: '',
      fixable: false,
      fullscreen: false,
      instance: null,
      linted: null,
      panel: null,
    };
  },
  computed: {
    theme () {
      return state.theme;
    },
    keymap () {
      return state.keymap;
    },
    fullscreenIcon () {
      let icon = 'mdi-fullscreen';
      if (this.fullscreen) {
        icon += '-exit';
      }
      return icon;
    },
    fullscreenText () {
      if (this.fullscreen) {
        return 'exit fullscreen';
      }
      return 'fullscreen';
    },
  },
  watch: {
    theme (value) {
      this.instance.setOption('theme', value);
      window.localStorage.setItem('theme', value);
    },
    keymap (value) {
      this.instance.setOption('keyMap', value);
      window.localStorage.setItem('keymap', value);
    },
  },
  mounted () {
    // Cursor template elements
    this.nodes.element = document.createElement('span');
    this.nodes.element.className = 'editor-cursor';
    this.nodes.element.style.color = '#2C87AF';

    this.nodes.flag = document.createElement('div');
    this.nodes.flag.className = 'editor-cursor-flag';
    this.nodes.flag.style.backgroundColor = '#2C87AF';

    //////////

    this.instance = CodeMirror.fromTextArea(this.$refs.textarea, {
      autoCloseBrackets: true,
      autoCloseTags: true,
      foldGutter: true,
      gutters: [
        'CodeMirror-lint-markers',
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter',
      ],
      keyMap: this.state.keymap,
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
      theme: this.state.theme,
      extraKeys: { 'Alt-Enter': () => {
        this.toggleFullscreen();
      } },
    });

    this.instance.vue = this;

    this.app = document.getElementById('app');
    window.addEventListener('resize', this.resize);

    this.instance.on('cursorActivity', (doc) => {
      this.$events.emit({
        type: 'editor:cursor:activity',
        data: {
          position: doc.getCursor(),
          user: this.state.user,
          name: this.state.name,
        },
      });
    });

    this.instance.on('change', (doc, change) => {
      if (this.file.updating === true) {
        this.file.updating = false;
      } else if (!(change.origin && change.origin.endsWith('-event'))) {
        this.$events.emit({
          type: 'editor:document:change',
          data: {
            path: this.file.path,
            change,
            contents: doc.getValue(),
            user: this.state.user,
            name: this.state.name,
          },
        });
      }
    });

    this.instance.on('beforeSelectionChange', (doc, selection) => {
      if (!(selection.origin && selection.origin.endsWith('-event'))) {
        this.$events.emit({
          type: 'editor:selection:change',
          data: {
            selection: {
              ranges: selection.ranges,
              origin: 'cursor',
            },
            user: this.state.user,
            name: this.state.name,
          },
        });
      }
    });

    this.panel = document.getElementById('interrogative-editor-panel');

    this.instance.addPanel(this.panel, {
      position: 'bottom',
      stable: true,
    });

    this.resize();

    //////////

    this.$events.on('editor:tab:focus', (event) => {
      const path = event.data.path;
      if (path && path !== this.focus) {
        this.setFocus(path);
      }
    });

    this.$events.on('editor:cursor:activity', (event) => {
      console.log('cursor', event);
      if (event.data.user !== this.state.user) {
        const cursor = this.getCursor(event.data.user, event.data.name);
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

    this.$events.on('editor:selection:change', (event) => {
      console.log('selection', event);
      if (event.data.user !== this.state.user) {
        const selection = event.data.selection;
        selection.origin = `${ selection.origin }-event`;

        if (Array.isArray(selection.ranges) && selection.ranges.length) {
          const {
            anchor, head,
          } = selection.ranges[0];

          if (anchor.ch === head.ch && anchor.line === head.line &&
              anchor.sticky === head.sticky && anchor.xRel === head.xRel) {
            if (this.hasSelection) {
              this.instance.setSelections(selection.ranges, 0, { origin: selection.origin });
              this.hasSelection = false;
            }
          } else {
            this.instance.setSelections(selection.ranges, 0, { origin: selection.origin });
            this.hasSelection = true;
          }
        }
      }
    });

    this.$events.on('files:file:updated', (event) => {
      const path = event.data.path;
      const file = state.files[path];
      if (this.state.documents.has(file.path)) {
        const doc = this.state.documents.get(file.path);
        if (this.focus === path) {
          file.updating = true;
        }
        doc.setValue(file.contents);
      }
    });

    this.$events.on('files:file:closed', (event) => {
      if (this.state.documents.has(event.data.path)) {
        this.state.documents.delete(event.data.path);
      }

      if (this.state.images.has(event.data.path)) {
        this.state.images.delete(event.data.path);
      }
    });

    this.$events.on('editor:fullscreen:toggle', (event) => {
      this.fullscreen = !this.instance.getOption('fullScreen');
      this.instance.setOption('fullScreen', this.fullscreen);
      this.panel.classList.toggle('interrogative-editor-panel-fullscreen');
      this.instance.focus();
    });
  },
  destroyed () {
    window.removeEventListener('resize', this.resize);
  },
  methods: {
    toBlob (file) {
      let blob;

      if (file.binary) {
        const data = file.contents;
        const bytes = new Uint8Array(data.length / 2);

        for (let i = 0; i < data.length; i += 2) {
          bytes[i / 2] = parseInt(data.substring(i, i + 2), 16);
        }
        blob = new Blob([ bytes ], { type: file.mime });
      } else {
        blob = new Blob([ file.contents ], { type: file.mime });
      }
      return blob;
    },
    asDocument (file) {
      if (!this.state.documents.has(file.path)) {
        const doc = CodeMirror.Doc(file.contents, file.mime);
        this.state.documents.set(file.path, doc);

        return doc;
      }
      return this.state.documents.get(file.path);
    },
    asImage (file) {
      if (!this.state.images.has(file.path)) {
        const blob = this.toBlob(file);
        const image = new Image();
        image.src = URL.createObjectURL(blob);

        this.state.images.set(file.path, image);

        return image;
      }
      return this.state.images.get(file.path);
    },
    setFocus (path) {
      this.focus = path;
      this.file = this.state.files[path];

      console.log('focusing', this.focus, this.file.path);

      if (this.file.mime.startsWith('image')) {
        this.mode = 'image';

        const image = this.asImage(this.file);

        while (this.$refs.image.hasChildNodes()) {
          this.$refs.image.removeChild(this.$refs.image.firstChild);
        }

        this.$refs.image.style.width = `${ this.width }px`;
        this.$refs.image.style.height = `${ this.height }px`;

        image.style.objectFit = 'scale-down';
        image.style.width = `${ this.width }px`;
        image.style.height = `${ this.height }px`;

        console.log('height', this.height);

        this.$refs.image.appendChild(image);
      } else if (this.file.extension === 'stl') {
        console.log('stl mode');
        this.mode = 'stl';
        this.blob = URL.createObjectURL(this.toBlob(this.file));
        console.log(this.blob);
      } else if (this.file.binary) {
        this.mode = 'hexdump';

        let content = '';

        const padding = Math.max(this.file.stat.size.toString(16).length, 8);
        const data = this.file.contents;
        for (let i = 0; i < data.length; i += 64) {
          const characters = [];
          content += i.toString(16).padStart(padding, '0');
          content += '  ';
          for (let j = 0; j < 64; j++) {
            if (j >= 8 && j % 8 === 0) {
              content += ' ';
            }
            const value = data[i + j];
            if (value === undefined) {
              content += ' ';
            } else {
              content += value.toUpperCase();
            }
            if (j % 2) {
              content += ' ';
              let character = parseInt(`${ data[i + j - 1] }${ data[i + j] }`, 16);
              if (Number.isNaN(character)) {
                character = '';
              } else if (character >= 32 && character <= 126) {
                character = String.fromCharCode(character);

                if (character === '<') {
                  character = '&lt;';
                } else if (character === '>') {
                  character = '&gt;';
                } else if (character === '&') {
                  character = '&amp;';
                } else if (character === '"') {
                  character = '&quot;';
                } else if (character === "'") {
                  character = '&apos';
                }
              } else {
                character = '.';
              }
              characters.push(character);
            }
          }
          content += '  ';
          content += characters.join('');
          content += '\n';
        }

        this.$refs.hexdump.style.width = `${ this.width }px`;
        this.$refs.hexdump.style.height = `${ this.height }px`;

        this.$refs.hexdump.innerHTML = content;
      } else if (!this.file.binary) {
        this.mode = 'editor';

        const doc = this.asDocument(this.file);

        if (this.instance.getDoc().id !== doc.id) {
          this.$nextTick(() => { // ensure editor is shown
            this.instance.swapDoc(doc);
          });
        }
      }
    },
    getCursor (user, name) {
      const id = this.instance.getDoc().id;
      if (!this.cursors[user] || !this.cursors[user][id]) {
        const element = this.nodes.element.cloneNode();
        const flag = this.nodes.flag.cloneNode();
        flag.innerHTML = name;
        element.appendChild(flag);

        this.cursors[user] = this.cursors[user] || { };

        this.cursors[user][id] = {
          user,
          element,
          flag,
          position: null,
          marker: null,
        };
      }
      return this.cursors[user][id];
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
      this.$events.emit({
        type: 'editor:fullscreen:toggle',
        data: this.fullscreen,
      });
    },
    resize () {
      const drawerWidth = 45; // this.state.mini ? 45 : 345;

      this.width = this.app.clientWidth - drawerWidth;
      this.height = this.app.clientHeight - 480;

      console.log('resize', this.state.mini, this.width, this.height);

      this.$refs.container.style.width = `${ this.width }px`;
      this.$refs.container.style.height = `${ this.height }px`;

      this.$refs.image.style.width = `${ this.width }px`;
      this.$refs.image.style.height = `${ this.height }px`;

      this.$refs.hexdump.style.width = `${ this.width }px`;
      this.$refs.hexdump.style.height = `${ this.height }px`;

      this.instance.setSize(this.width, this.height);
    },
  },
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
  flex-grow: 1;
  box-sizing: border-box;
  background-color: #595959;
  height: 20px;
  padding: 0;
  margin: 0;
  font-size: 12px;
  line-height: 18px;
}

.interrogative-editor-panel-fullscreen {
  position: fixed;
  z-index: 10;
  bottom: 0;
  left: 0;
  border-radius: 0 !important;
}

.interrogative-editor-spacer-left {
  padding-left: 8px;
}

.CodeMirror {
  font-size: 14px;
}

.CodeMirror-fullscreen {
  margin-bottom: 20px;
}

.image-preview {
  position: absolute;
  top: 30px;
  left: 0;
  overflow: hidden;
  background-color: #222;
  padding: 0;
  margin: 0;
  z-index: 20;
}

.hexdump {
  position: absolute;
  top: 30px;
  left: 0;
  overflow: hidden;
  overflow-y: scroll;
  background-color: #222;
  padding: 0;
  margin: 0;
  z-index: 30;
}

.hexdump-pre {
  padding: 2px 8px;
  font-size: 12px;
  font-family: Source Code Pro, monospace;
}

.bump {
  padding-top: 1px;
}

.editor-cursor {
  border-radius: 0 0 3px 3px;
  border-left: 2px solid currentColor;
  cursor: pointer;
  height: 16px;
  padding: 0;
  z-index: 0;
}

.editor-cursor-flag {
  border-radius: 3px 3px 3px 0;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  height: 11px;
  line-height: 10px;
  min-width: 24px;
  opacity: 0;
  padding: 2px 4px;
  pointer-events: none;
  position: absolute;
  text-shadow: none;
  text-transform: uppercase;
  transition: opacity 0.5s ease-in-out;
  top: -12px;
  width: auto;
  z-index: 100;
}

.editor-cursor:hover > .editor-cursor-flag {
  opacity: 1;
}
</style>

import { Component } from '@angular/core';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, StateEffect,Range } from '@codemirror/state';
import { Decoration, ViewPlugin, ViewUpdate, WidgetType, DecorationSet } from '@codemirror/view';
import { diff_match_patch, Diff } from 'diff-match-patch';

@Component({
  selector: 'app-file-compare',
  standalone: true,
  imports: [],
  templateUrl: './file-compare.component.html',
  styleUrl: './file-compare.component.scss'
})
export class FileCompareComponent {
  editor1!: EditorView;
  editor2!: EditorView;
  dmp: diff_match_patch;

  constructor() {
    this.dmp = new diff_match_patch();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeEditors();
  }

  initializeEditors(): void {
    const initialState1 = EditorState.create({
      doc: 'Paste your file 1 content here...',
      extensions: [basicSetup]
    });

    const initialState2 = EditorState.create({
      doc: 'Paste your file 2 content here...',
      extensions: [basicSetup]
    });

    this.editor1 = new EditorView({
      state: initialState1,
      parent: document.querySelector('#editor1')!
    });

    this.editor2 = new EditorView({
      state: initialState2,
      parent: document.querySelector('#editor2')!
    });
  }

  compareFiles(): void {
    const text1 = this.editor1.state.doc.toString();
    const text2 = this.editor2.state.doc.toString();
    const diff = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diff);
    this.highlightDifferences(diff);
  }

  highlightDifferences(diff: Diff[]): void {
    const decorations1: Range<Decoration>[] = [];
    const decorations2: Range<Decoration>[] = [];
    let pos1 = 0, pos2 = 0;

    diff.forEach(([op, data]) => {
      const from1 = pos1, from2 = pos2;
      if (op === 0) { // Equal
        pos1 += data.length;
        pos2 += data.length;
      } else if (op === -1) { // Delete from editor1
        pos1 += data.length;
        decorations1.push(this.createLineDecoration(from1, pos1, 'delete'));
        decorations1.push(this.createWidgetDecoration(from1, 'delete', data, 2));
      } else { // Insert to editor2
        pos2 += data.length;
        decorations2.push(this.createLineDecoration(from2, pos2, 'insert'));
        decorations2.push(this.createWidgetDecoration(from2, 'insert', data, 1));
      }
    });

    this.applyHighlights(this.editor1, decorations1);
    this.applyHighlights(this.editor2, decorations2);
  }

  createLineDecoration(from: number, to: number, className: string): Range<Decoration> {
    return Decoration.line({
      attributes: {
        class: className,
        style: 'position: relative;'
      }
    }).range(from, to);
  }

  createWidgetDecoration(pos: number, className: string, data: string, editorNumber: number): Range<Decoration> {
    return Decoration.widget({
      widget: new MergeWidget(data, editorNumber, this),
      side: 1,
    }).range(pos, pos);
  }

  applyHighlights(editor: EditorView, decorations: Range<Decoration>[]): void {
    const decoPlugin = ViewPlugin.fromClass(class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = Decoration.set(decorations);
      }

      update(update: ViewUpdate) {}
    });

    editor.dispatch({
      effects: StateEffect.appendConfig.of([decoPlugin])
    });
  }

  mergeLine(data: string, editorNumber: number): void {
    if (editorNumber === 1) {
      this.editor2.dispatch({
        changes: { from: 0, to: this.editor2.state.doc.length, insert: data }
      });
    } else {
      this.editor1.dispatch({
        changes: { from: 0, to: this.editor1.state.doc.length, insert: data }
      });
    }
  }
}

class MergeWidget extends WidgetType {
  constructor(readonly data: string, readonly editorNumber: number, readonly parent: FileCompareComponent) {
    super();
  }

  toDOM(): HTMLElement {
    const wrap = document.createElement('span');
    wrap.className = 'merge-icon';
    wrap.innerText = '⇨';
    wrap.title = 'Merge this line';
    wrap.onclick = () => {
      this.parent.mergeLine(this.data, this.editorNumber);
    };
    return wrap;
  }

  override eq(widget: WidgetType): boolean {
    return widget instanceof MergeWidget &&
      widget.data === this.data &&
      widget.editorNumber === this.editorNumber;
  }

  override ignoreEvent(): boolean {
    return false;
  }
}
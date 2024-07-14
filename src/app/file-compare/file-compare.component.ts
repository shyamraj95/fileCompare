import { DOCUMENT } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, Renderer2, ChangeDetectorRef, Inject } from '@angular/core';

declare var CodeMirror: any;
declare var js_beautify: any;

@Component({
  selector: 'app-file-compare',
  standalone: true,
  imports: [],
  templateUrl: './file-compare.component.html',
  styleUrl: './file-compare.component.scss'
})
export class FileCompareComponent implements AfterViewInit {
  wrapText: boolean = false;
  connect: string | null = null;
  panes!: number;
  leftContent: string = "";
  rightContent: string = "";
  private mergeViewEditor: any;
  firstFileName: string = "No file selected";
  secondFileName: string = "No file selected";



  constructor(@Inject(DOCUMENT) private document: Document) { }

  ngAfterViewInit() {
    this.formatAndCompare();
  }
  formatAndCompare() {
    // const target = this.editorContainer.nativeElement;
    const target = this.document.getElementById("view") as HTMLDivElement;
    if (this.mergeViewEditor) {
      this.rightContent = this.mergeViewEditor.rightOriginal().getValue();
      this.leftContent = this.mergeViewEditor.editor().getValue();
    }
    target.innerHTML = "";
    this.mergeViewEditor = CodeMirror.MergeView(target, {
      value: this.leftContent,
      origLeft: this.panes == 3 ? this.mergeViewEditor.rightOriginal().getValue() : null,
      orig: this.rightContent,
      lineNumbers: true,
      mode: "application/json",
      showDifferences: true,
      connect: this.connect,
      collapseIdentical: false,
      revertButtons: true,
      allowEditingOriginals: true,
      highlightDifferences: true,
      matchBrackets: true,
      autofocus: true,
      chunkClassLocation: ['background', 'wrap', 'gutter']
    });
  }
  onFileChange(event: any, fileType: string) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const content = e.target.result;
      if (fileType === 'first') {
        this.mergeViewEditor.editor().setValue(content);
        this.firstFileName =  file.name;
      } else {
        this.mergeViewEditor.rightOriginal().setValue(content);
        this.secondFileName = file.name;
      }
    };
    reader.readAsText(file);
  }
  onLanguageChange(event: Event) {
    const target = event.target as HTMLInputElement;
  }
  onChangeConnect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.connect = null;
    } else {
      this.connect = "align";
    }
    this.formatAndCompare();
  }
  onChangeThreeWay(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.panes = 3;
    } else {
      this.panes = 2;
    }
    this.formatAndCompare();
  }

  onWrapChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.mergeViewEditor.editor().setOption('lineWrapping', true);
      this.mergeViewEditor.rightOriginal().setOption('lineWrapping', true);
      this.mergeViewEditor.editor().setValue(js_beautify(this.mergeViewEditor.editor().getValue()));
      this.mergeViewEditor.rightOriginal().setValue(js_beautify(this.mergeViewEditor.rightOriginal().getValue()));
    } else {
      this.mergeViewEditor.editor().setOption('lineWrapping', false);
      this.mergeViewEditor.rightOriginal().setOption('lineWrapping', false);
    }
  }

}
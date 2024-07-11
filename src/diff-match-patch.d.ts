declare module 'diff-match-patch' {
    export class diff_match_patch {
      constructor();
      diff_main(text1: string, text2: string): any[];
      diff_cleanupSemantic(diffs: any[]): void;
    }
  
    export type Diff = [number, string];
  }
  
declare module 'd3-cloud' {
  interface Word {
    text: string;
    size?: number;
    value?: number;
    x?: number;
    y?: number;
    rotate?: number;
    font?: string;
    padding?: number;
  }

  interface Cloud {
    size(): [number, number];
    size(size: [number, number]): Cloud;
    words(): Word[];
    words(words: Word[]): Cloud;
    font(): (word: Word) => string;
    font(font: string | ((word: Word) => string)): Cloud;
    fontSize(): (word: Word) => number;
    fontSize(fontSize: number | ((word: Word) => number)): Cloud;
    fontStyle(): (word: Word) => string;
    fontStyle(fontStyle: string | ((word: Word) => string)): Cloud;
    fontWeight(): (word: Word) => string;
    fontWeight(fontWeight: string | ((word: Word) => string)): Cloud;
    padding(): (word: Word) => number;
    padding(padding: number | ((word: Word) => number)): Cloud;
    rotate(): (word: Word) => number;
    rotate(rotate: number | ((word: Word) => number)): Cloud;
    text(): (word: Word) => string;
    text(text: string | ((word: Word) => string)): Cloud;
    spiral(): (size: [number, number]) => (t: number) => [number, number];
    spiral(spiral: string | ((size: [number, number]) => (t: number) => [number, number])): Cloud;
    random(): () => number;
    random(random: () => number): Cloud;
    canvas(): () => HTMLCanvasElement;
    canvas(canvas: () => HTMLCanvasElement): Cloud;
    start(): Cloud;
    stop(): Cloud;
    timeInterval(): number;
    timeInterval(timeInterval: number): Cloud;
    on(type: string, listener: (words: Word[]) => void): Cloud;
  }

  function cloud(): Cloud;
  export default cloud;
}

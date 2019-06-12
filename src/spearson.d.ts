declare module 'spearson' {
  function sort(x: number[]): number;
  function round(x: number, n: number): number;
  function min(x: number[]): number;
  function max(x: number[]): number;
  function range(start: number, stop: number): number[];
  function sum(x: number[]): number;
  function median(x: number[]): number;
  function mean(x: number[]): number;
  function deviation(x: number[]): number;
  function variance(x: number[], bias: boolean): number;
  function standardDeviation(x: number[], bias: boolean): number;
  function standardize(x: number[]): number;
  function rank(x: number[]): number[];
  interface correlation {
    pearson(x: number[], y: number[], standardize: boolean): number;
    spearman(x: number[], y: number[], rank: boolean): number;
  }
  interface distance {
    euclidean(x: number, y: number): number;
    manhattan(x: number, y: number): number;
  }
  function pairwiseDistance(x: number[][], distanceMetric: Object): number[][];
  function hierarchicalClustering(
    pairwiseDistances: number[][],
    linkage: String
  ): number[];
}

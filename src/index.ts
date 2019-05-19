var { PCA } = require('ml-pca');

// // dataset is a two-dimensional array where rows represent the samples and columns the features
const dataset: number[][] = [];
// const individual = individualStats[0];
for (let individual of individualStats) {
  const sample: number[] = [];
  for (let prop of Object.entries(individual)) {
    // ["baz", 42]
    switch (prop[0]) {
      case 'teamName':
      case 'year':
      case 'name':
        break;
      default:
        sample.push(prop[1] !== null ? +prop[1] : 0);
        break;
    }
  }
  dataset.push(sample);
}
console.log(`dataset: \n ${dataset}`);

const pca = new PCA(dataset);
console.log(`Explained Variance: \n ${pca.getExplainedVariance()}`);
console.log(`PCA Object: ${pca.toJSON()}`);
// const newPoints = [[4.9, 3.2, 1.2, 0.4], [5.4, 3.3, 1.4, 0.9]];
// console.log(pca.predict(newPoints)); // project new points into the PCA space

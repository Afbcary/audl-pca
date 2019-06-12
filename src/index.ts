import Chart, { ChartTooltipItem } from 'chart.js';
import spearson from 'spearson';
import { analyzedStats } from '../assets/AnalyzedStats';
import { individualStats } from '../assets/IndividualStats';
var Plotly = require('plotly.js-cartesian-dist');

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

// HEATMAP
// organize into pearson / spearman input
// 3714 records, 55 features so 55 x 3714 array
const spearsonDataset: number[][] = [];
let featureIndex = 0;
while (featureIndex < dataset[0].length) {
  spearsonDataset[featureIndex] = [];
  for (let row of dataset) {
    spearsonDataset[featureIndex].push(row[featureIndex]);
  }
  featureIndex++;
}
console.log(`spearsonDataset`);
console.log(spearsonDataset);

const pearsonCorrelations: number[][] = [];
for (let i = 0 ; i < spearsonDataset.length ; i++) {
  pearsonCorrelations.push(new Array<number>());
  for (let j = 0 ; j < spearsonDataset.length ; j++) {
    pearsonCorrelations[i][j] = spearson.correlation.pearson(
      spearsonDataset[i],
      spearsonDataset[j],
      true
    );
  }
}

console.log(`pearsonCorrelations`);
console.log(pearsonCorrelations);

var data = [
  {
    z: pearsonCorrelations,
    x: analyzedStats,
    y: analyzedStats,
    type: 'heatmap'
  }
];

Plotly.newPlot('heatmap', data, { autosize: true, height: 1200, yaxis: {automargin: true}, xaxis: {automargin: true}}, { showSendToCloud: true});

console.log(`dataset`);
console.log(dataset);

// test with the scale false and see if data needs to be scaled in addition to being centered
const pca = new PCA(dataset, { scale: true });
console.log(`Explained Variance`);
console.log(pca.getExplainedVariance());
console.log(`PCA Object`);
console.log(pca);
console.log(`Cumulative Variance`);
console.log(pca.getCumulativeVariance());
console.log(`Eigenvectors`);
console.log(pca.getEigenvectors());
console.log(`Eigenvalues`);
console.log(pca.getEigenvalues());
console.log(`standard deviations`);
console.log(pca.getStandardDeviations());
console.log(`loadings`);
console.log(pca.getLoadings());

console.log(`-------------------`);
const numSignificantComponents = 2;

const featureVector: number[][] = [];
for (let i = 0; i < numSignificantComponents; i++) {
  featureVector.push(pca.getEigenvectors().data[i]);
}
console.log(`Feature vector 2D`);
console.log(featureVector);

// finalDataSet = featureVector(transpose) * standardizedOriginalDataSet(transpose)
//                    2 x 55                        3714 x 55
// I need the first to be 55 x 2 so that the matricies can be transposed and multiplied
// final dataset should be 2 x 3714 ???
// 3714 x 2 makes more sense

const prediction = pca.predict(dataset);
console.log('prediction');
console.log(prediction);

// trying to get the dataset projected into the space of the first two computed components
const projectedData: Object[] = [];
for (let row of prediction.data) {
  projectedData.push({ x: row[0], y: row[1] });
}
console.log('projectedData');
console.log(projectedData);

generateScatterChart('prediction-chart', '2D Projection', projectedData);
// https://github.com/mrdoob/three.js/

const componentsShown = 10;

const variancePercentages: number[] = pca
  .getExplainedVariance()
  .slice(0, componentsShown)
  .map((d: number) => d * 100)
  .filter((d: number) => d > 0);

const cumulativeVariancePercentages: number[] = pca
  .getCumulativeVariance()
  .slice(0, componentsShown)
  .map((d: number) => d * 100);

generateBarGraph(
  'variance-chart',
  variancePercentages,
  'Variance',
  'Component Variance',
  cumulativeVariancePercentages,
  'Cumulative Variance'
);

function generateBarGraph(
  canvasName: string,
  sortedData: number[],
  labelText: string,
  title: string,
  cumulativeVariance: number[],
  labelText2: string
) {
  var ctx = (<HTMLCanvasElement>(
    document.getElementById(canvasName)!
  )).getContext('2d');

  let minValue = 0;
  let maxValue = 1;
  if (sortedData.length > 0) {
    maxValue = sortedData[0];
    minValue = sortedData[sortedData.length - 1];
  }

  const formattedValues: string[] = sortedData.map(d =>
    d < 1 ? d.toExponential(3).toString() : d.toPrecision(3)
  );

  const labels: string[] = [];
  for (let i = 0; i < sortedData.length; i++) {
    labels.push(`PC${i}`);
  }

  const chartData: Chart.ChartData = {
    labels: labels,
    datasets: [
      {
        type: 'bar',
        label: labelText,
        data: sortedData,
        backgroundColor: sortedData.map(d =>
          hsl_col_perc(d, minValue, maxValue)
        ),
        borderWidth: 1
      },
      {
        type: 'line',
        label: labelText2,
        data: cumulativeVariance,
        backgroundColor: `hsl(243, 100%, 80%)`,
        borderWidth: 1,
        showLine: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    legend: { display: false },
    title: {
      display: true,
      text: title
    },
    scales: {
      yAxes: [
        {
          ticks: {
            suggestedMin: 0,
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: '% Variance'
          }
        }
      ]
    },
    tooltips: {
      intersect: false,
      callbacks: {
        title: function(toolTipItems: ChartTooltipItem[]): string {
          const item: ChartTooltipItem = toolTipItems[0];
          if (item.datasetIndex === 1) {
            return 'Cumulative Variance';
          }
          return String(item.xLabel);
        },
        label: function(tooltipItem: ChartTooltipItem): string {
          if (tooltipItem.datasetIndex === 1) {
            return String(cumulativeVariancePercentages[tooltipItem.index!]);
          }
          return formattedValues[tooltipItem.index!] + '%';
        }
      }
    }
  };

  var chart = new Chart(ctx!, {
    type: 'bar',
    data: chartData,
    options: options
  });
  return chart;
}

function hsl_col_perc(value: number, min: number, max: number) {
  const range = max - min;
  const place = value - min;
  const percent = place / range;
  const colorPercent = 70 - (percent * 100) / 2;
  return `hsl(243, 100%, ${colorPercent}%)`;
}
// canvasName: string,
//   sortedData: number[],
//   labelText: string,
//   title: string,
//   cumulativeVariance: number[],
//   labelText2: string
function generateScatterChart(
  canvasName: string,
  title: string,
  data: Object[]
) {
  var ctx = (<HTMLCanvasElement>(
    document.getElementById(canvasName)!
  )).getContext('2d');

  var chartData: Chart.ChartData = {
    datasets: [
      {
        label: 'Players',
        type: 'scatter',
        backgroundColor: 'hsl(244, 100%, 50%)',
        pointRadius: 5,
        data: data,
        showLine: false
      }
    ]
  };

  const options = {
    title: { display: true, text: title },
    scales: {
      xAxes: [
        {
          type: 'linear',
          position: 'bottom',
          scaleLabel: {
            display: true,
            labelString: 'PC_0'
          }
        }
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'PC_1'
          }
        }
      ]
    },
    tooltips: {
      intersect: false
    }
  };

  var scatterChart = new Chart(ctx!, {
    type: 'scatter',
    data: chartData,
    options: options
  });
  return scatterChart;
}

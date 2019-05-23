import Chart, { ChartTooltipItem } from 'chart.js';

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
console.log(`dataset`);
console.log(dataset);

const pca = new PCA(dataset);
console.log(`Explained Variance`);
console.log(pca.getExplainedVariance());
console.log(`PCA Object`);
console.log(pca.toJSON());

const variancePercentages: number[] = pca
  .getExplainedVariance()
  .map((d: number) => d * 100)
  .filter((d: number) => d > 0);

generateBarGraph(
  'variance-chart',
  variancePercentages,
  'Variance',
  'Component Variance'
);

function generateBarGraph(
  canvasName: string,
  sortedData: number[],
  labelText: string,
  title: string
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

  var chart = new Chart(ctx!, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: labelText,
          data: sortedData,
          backgroundColor: sortedData.map(d =>
            hsl_col_perc(d, minValue, maxValue)
          ),
          borderWidth: 1
        }
      ]
    },
    options: {
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
            const item : ChartTooltipItem  =  toolTipItems[0]
            return String(item.xLabel);
          },
          label: function(tooltipItem: ChartTooltipItem): string {
            return formattedValues[tooltipItem.index!];
            // return String(tooltipItem.yLabel);
          }
        }
      }
    }
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

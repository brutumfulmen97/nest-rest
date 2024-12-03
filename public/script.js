import { renderGanttChart } from './render-chart.js';

const data = await fetch('/dummy.json').then((res) => res.json());

renderGanttChart(data);

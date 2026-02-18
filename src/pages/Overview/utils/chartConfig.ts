import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
 GridComponent,
 TooltipComponent,
 TitleComponent,
 LegendComponent,
 DatasetComponent,
 DataZoomComponent
} from 'echarts/components';
import { TreeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
 BarChart, 
 LineChart, 
 GridComponent, 
 TooltipComponent, 
 TitleComponent, 
 LegendComponent, 
 DatasetComponent, 
 DataZoomComponent, 
 TreeChart,
 CanvasRenderer 
]);

export { echarts };

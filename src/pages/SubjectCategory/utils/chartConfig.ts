import * as echarts from 'echarts/core';
import { BarChart, LineChart, MapChart } from 'echarts/charts';
import {
 GridComponent,
 TooltipComponent,
 TitleComponent,
 LegendComponent,
 DatasetComponent,
 VisualMapComponent,
 GeoComponent,
 ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
 BarChart,
 LineChart,
 MapChart,
 GridComponent,
 TooltipComponent,
 TitleComponent,
 LegendComponent,
 DatasetComponent,
 VisualMapComponent,
 GeoComponent,
 CanvasRenderer,
 ToolboxComponent
]);

export { echarts };

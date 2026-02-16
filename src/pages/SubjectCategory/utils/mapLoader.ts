import { echarts } from './chartConfig';

let gujaratMapRegistered = false;
let gujaratMapLoading: Promise<void> | null = null;

export async function ensureGujaratMapRegistered(): Promise<void> {
  if (gujaratMapRegistered) {
    return;
  }

  if (gujaratMapLoading) {
    await gujaratMapLoading;
    return;
  }

  gujaratMapLoading = (async () => {
    try {
      const url = new URL('../../../../assets/Gujdistricts.geojson', import.meta.url).href;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const geo: any = await res.json();

      geo.features.forEach((feature: any) => {
        feature.properties.name = feature.properties.District;
      });

      echarts.registerMap('gujarat', geo);
      gujaratMapRegistered = true;
    } finally {
      gujaratMapLoading = null;
    }
  })();

  await gujaratMapLoading;
}


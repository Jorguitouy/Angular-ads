const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const response = await page.goto('https://arreglo.servicedecalefones.uy', { waitUntil: 'load' });

    // 1. Analizar encabezados de caché
    const headers = await response.allHeaders();
    console.log('--- Encabezados de Caché ---');
    console.log(`Cache-Control: ${headers['cache-control'] || 'No especificado'}`);
    console.log(`Expires: ${headers['expires'] || 'No especificado'}`);
    console.log(`ETag: ${headers['etag'] || 'No especificado'}`);
    console.log(`Last-Modified: ${headers['last-modified'] || 'No especificado'}`);
    console.log('--------------------------\n');

    // 2. Obtener métricas de rendimiento
    const performanceMetrics = await page.evaluate(() => {
      const paintTimings = performance.getEntriesByType('paint');
      const fcp = paintTimings.find(entry => entry.name === 'first-contentful-paint')?.startTime;
      
      const timing = performance.timing;
      const ttfb = timing.responseStart - timing.requestStart;
      const loadTime = timing.loadEventEnd - timing.navigationStart;

      return {
        fcp: fcp,
        ttfb: ttfb,
        loadTime: loadTime
      };
    });
    
    console.log('--- Métricas de Rendimiento (en ms) ---');
    console.log(`Time to First Byte (TTFB): ${performanceMetrics.ttfb.toFixed(2)} ms`);
    console.log(`First Contentful Paint (FCP): ${performanceMetrics.fcp ? performanceMetrics.fcp.toFixed(2) : 'No disponible'} ms`);
    console.log(`Tiempo de carga total de la página: ${performanceMetrics.loadTime.toFixed(2)} ms`);
    console.log('------------------------------------');

    await browser.close();
  } catch (error) {
    console.error('Ocurrió un error durante el análisis:', error);
  }
})();

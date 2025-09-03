const { camelCase, startCase } = require('lodash');

const previewAppGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import {
  AppliedPrompts,
  Context,
  onDrillDownFunction,
  ResponseData,
  TContext
} from '@incorta-org/component-sdk';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CONFIG } from './types/constants';
import { VisualizationPipeline } from './components/VisualizationPipeline';
import { LLMResponse } from './types/pipeline';
import visualization_result from '../visualization_result.json';

interface Props {
  context: Context<TContext>;
  prompts: AppliedPrompts;
  data: ResponseData;
  drillDown: onDrillDownFunction;
}

const PreviewApp = ({ context, prompts, data, drillDown }: Props) => {
  console.log("rendering preview app")
  console.log({ data: data });
  const sample = buildSampleFromData(data as any);
            console.log({sample : sample})

  // const isDev = process.env.NODE_ENV !== 'production';
  const isDev = false;
  const hasFields = useMemo(() => {
    try {
      const mh = (data as any)?.measureHeaders ?? [];
      const rh = (data as any)?.rowHeaders ?? [];
      return (Array.isArray(mh) ? mh.length : 0) + (Array.isArray(rh) ? rh.length : 0) > 0;
    } catch {
      return false;
    }
  }, [data]);

  // derive sessionId from query param (iframe) or context
  const sessionId = useMemo(() => {
    // const isDev = process.env.NODE_ENV !== 'production';
    const isDev = false;
    if (isDev && (CONFIG as any).DEFAULT_SESSION_ID) return (CONFIG as any).DEFAULT_SESSION_ID;
    return (context as any)?.sessionId || 'default';
  }, [context]);

  const wsRef = useRef<WebSocket | null>(null);
  const llmReadyRef = useRef(false);
  const [llmSpec, setLlmSpec] = useState<any | null>(null);


  console.log({isDev : isDev})

  useEffect(() => {
    if (!isDev) {
      console.log({visualization_result : visualization_result})
      setLlmSpec(visualization_result);
      llmReadyRef.current = true;
      return;
    }; // prod: no gating
    try {
      const url = \`ws://localhost:8080/ws/\${encodeURIComponent(sessionId)}\`;
      console.log({url : url})
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        // no-op; wait for server messages
        console.log("ws opened")
      };
      ws.onmessage = (ev) => {
        console.log({ev : ev.data})
        try {
          const msg = JSON.parse(ev.data);
          if (msg?.type === 'CHART_UPDATE') {
            console.log({msg : msg.payload})
            llmReadyRef.current = true;
            setLlmSpec(msg.payload.visualization_result);
            console.log("llm ready set to true")
          } else if (msg?.type === 'DATA_SAMPLE_REQUEST') {
            // Build a lightweight sample from current data/headers
            const sample = buildSampleFromData(data as any);
            console.log({sample : sample})
            console.log("requested data sample")
            const response = { type: 'DATA_SAMPLE_RESPONSE', payload: sample };
            try { ws.send(JSON.stringify(response)); } catch {};
          } else if (msg?.type === 'LLM_RESET') {
            // Reset LLM state when starting new generation
            console.log("🔄 Resetting LLM state for new generation")
            llmReadyRef.current = false;
            setLlmSpec(null);
          }
        } catch (error) {
          // ignore
        }
      };
      ws.onerror = () => {
        // ignore in dev
      };
      ws.onclose = () => {
        wsRef.current = null;
      };
      return () => {
        try { ws.close(); } catch {}
      };
    } catch {
      return undefined;
    }
  }, [isDev, sessionId]);

  if (!hasFields) {
    return <div style={{ padding: 16 }}>Place fields in Incorta to enable preview.</div>;
  }

  console.log({llmReadyRef : llmReadyRef.current})
  console.log({llmSpecBefore : llmSpec})
  if (isDev && !llmReadyRef.current) {
    return <div style={{ padding: 16 }}>Waiting for LLM instructions…</div>;
  }

  console.log({llmSpec : llmSpec})

  // Use the visualization pipeline
  if (llmSpec) {
    return <VisualizationPipeline spec={llmSpec} context={context} prompts={prompts} fallbackData={data} />;
  }
  
  // Production mode
  if (!isDev) {
    return (
      <div style={{ padding: '16px' }}>
        <h2>Production Mode</h2>
      </div>
    );
  }
  
  // Fallback
  return (
    <div style={{ padding: '16px' }}>
      <h1>Preview App</h1>
      <p>Waiting for instructions...</p>
    </div>
  );
};


function buildSampleFromData(data: any) {
  try {
    const mh = Array.isArray(data?.measureHeaders) ? data.measureHeaders : [];
    const rh = Array.isArray(data?.rowHeaders) ? data.rowHeaders : [];
    const rows = Array.isArray(data?.data) ? data.data : [];
    const headerNames = [
      ...rh.map((h: any) => h.label || h.name || 'dim'),
      ...mh.map((h: any) => h.label || h.name || 'meas'),
    ];
    const sampleRows = rows.slice(0, 5).map((r: any[]) => r.map((c: any) => c?.formatted ?? c?.value ?? c));
    
    // Add data size information for LLM decision making
    const totalRows = data?.totalRows || rows.length;
    const dataSize = {
      totalRows,
      sampleRows: sampleRows.length,
      totalColumns: headerNames.length,
      isSampled: data?.isSampled || false,
      isLargeDataset: totalRows > 100,
      isVeryLargeDataset: totalRows > 1000,
      datasetSizeCategory: totalRows <= 20 ? 'small' : 
                          totalRows <= 100 ? 'medium' : 
                          totalRows <= 1000 ? 'large' : 'very_large'
    };
    
    return { 
      headers: headerNames, 
      rows: sampleRows, 
      dataSize,
      originalDataInfo: {
        rowHeaders: rh.length,
        measureHeaders: mh.length,
        isAggregated: data?.isAggregated || false
      }
    };
  } catch {
    return { headers: [], rows: [], dataSize: { totalRows: 0, datasetSizeCategory: 'unknown' } };
  }
}

export default PreviewApp;
`;
};

module.exports = previewAppGenerator;



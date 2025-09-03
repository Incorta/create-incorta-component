const { camelCase, startCase } = require('lodash');

const htmlRendererGenerator = ({ directory }) => {
  const pascalCaseName = startCase(camelCase(directory)).replace(/ /g, '');
  return `import React, { useMemo, useEffect, useRef, useState, createElement } from 'react';

interface HtmlRendererProps {
  data: any;
  config: any;
}

export const HtmlRenderer: React.FC<HtmlRendererProps> = ({ 
  data, 
  config 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [jsxComponent, setJsxComponent] = useState<React.ComponentType<any> | null>(null);
  
  const htmlContent = useMemo(() => {
    try {
      console.log('HtmlRenderer config:', JSON.stringify(config, null, 2));
      console.log('HtmlRenderer data:', data);
      
      // Check if config has generatedCode (from LLM-generated HTML)
      if (config?.generatedCode) {
        console.log('Using LLM-generated HTML code:', config.generatedCode);
        
        let htmlCode = config.generatedCode;
        
        // Check if this is React component code (contains function and React.createElement)
        if (typeof htmlCode === 'string' && htmlCode.includes('function ') && htmlCode.includes('React.createElement')) {
          console.log('Detected React component code, evaluating and rendering...');
          
          try {
            // For JSX components, we'll set it as a state and render it separately
            const component = createJSXComponent(htmlCode, data);
            setJsxComponent(() => component);
            return null; // Will be handled by the component rendering below
          } catch (error: any) {
            console.error('Error rendering JSX component:', error);
            return \`
              <div style="background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 12px; border-radius: 4px;">
                <strong>Error rendering React component:</strong> \${error.message}
                <details style="margin-top: 8px;">
                  <summary>React Component Code:</summary>
                  <pre style="background: #f8f9fa; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 12px;">\${htmlCode}</pre>
                </details>
              </div>
            \`;
          }
        }
        
        // Check if this is a complete HTML document (starts with <html> or <!DOCTYPE)
        if (typeof htmlCode === 'string' && (htmlCode.trim().startsWith('<html') || htmlCode.trim().startsWith('<!DOCTYPE'))) {
          console.log('Detected complete HTML document, extracting body content...');
          
          try {
            // Parse the HTML document and extract content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlCode, 'text/html');
            
            // Extract and inject CSS from head
            const styles = doc.querySelectorAll('head style');
            let extractedCSS = '';
            styles.forEach(style => {
              extractedCSS += style.textContent || '';
            });
            
            // Extract body content
            const bodyContent = doc.body?.innerHTML || '';
            
            // Extract and execute scripts
            const scripts = doc.querySelectorAll('script');
            let extractedJS = '';
            scripts.forEach(script => {
              if (script.textContent) {
                extractedJS += script.textContent + '\\\n';
              }
            });
            
            // Create a combined HTML with inline styles and executable scripts
            const processedHTML = \`
              <style>\${extractedCSS}</style>
              <div class="html-document-container">
                \${bodyContent}
              </div>
              <script>
                (function() {
                  try {
                    // Provide data to the script context
                    const data = \${JSON.stringify(data)};
                    \${extractedJS}
                  } catch (error) {
                    console.error('Error executing HTML document script:', error);
                  }
                })();
              </script>
            \`;
            
            console.log('Processed HTML document:', processedHTML);
            return processedHTML;
            
          } catch (error: any) {
            console.error('Error processing HTML document:', error);
            return \`
              <div style="background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 12px; border-radius: 4px;">
                <strong>Error processing HTML document:</strong> \${error.message}
                <details style="margin-top: 8px;">
                  <summary>Original HTML Document:</summary>
                  <pre style="background: #f8f9fa; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 12px;">\${htmlCode}</pre>
                </details>
              </div>
            \`;
          }
        }
        
        // Check if the generatedCode contains a JavaScript function that needs to be executed
        if (typeof htmlCode === 'string' && htmlCode.includes('function ') && htmlCode.includes('renderChart')) {
          console.log('Detected JavaScript function in generatedCode, executing...');
          
          try {
            // Create a safe execution environment
            const executeFunction = new Function('data', 'Highcharts', 'document', \`
              \${htmlCode}
              
              // Execute the renderChart function with the provided data
              if (typeof renderChart === 'function') {
                return renderChart(data);
              } else {
                return '<div style="color: red;">Error: renderChart function not found</div>';
              }
            \`);
            
            // Execute with the data and return the result
            const result = executeFunction(data, window.Highcharts, document);
            console.log('Function execution result:', result);
            return result || '<div style="color: orange;">Function returned empty result</div>';
            
          } catch (error : any) {
            console.error('Error executing JavaScript function:', error);
            return \`
              <div style="background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 12px; border-radius: 4px;">
                <strong>Error executing JavaScript function:</strong> \${error.message}
                <details style="margin-top: 8px;">
                  <summary>Generated Code:</summary>
                  <pre style="background: #f8f9fa; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 12px;">\${htmlCode}</pre>
                </details>
              </div>
            \`;
          }
        }
        
        // If the generatedCode is escaped HTML, try to unescape it
        if (typeof htmlCode === 'string' && htmlCode.includes('&lt;')) {
          console.log('Detected escaped HTML, unescaping...');
          htmlCode = htmlCode
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&amp;/g, '&');
        }
        
        return htmlCode;
      }
      
      // Fallback to config.options if available
      if (config?.options?.generatedCode) {
        console.log('Using generatedCode from config.options:', config.options.generatedCode);
        return config.options.generatedCode;
      }
      
      // Check if config.additionalOptions has generatedCode
      if (config?.additionalOptions?.generatedCode) {
        console.log('Using generatedCode from config.additionalOptions:', config.additionalOptions.generatedCode);
        return config.additionalOptions.generatedCode;
      }
      
      // Final fallback - simple data display
      console.log('No generatedCode found, using fallback. Config keys:', Object.keys(config || {}));
      return generateFallbackHtml(data, config);
      
    } catch (error) {
      console.error('Error processing HTML content:', error);
      return \`
        <div style="
          background: #fff3cd; 
          border: 1px solid #ffeeba; 
          color: #856404; 
          padding: 12px; 
          border-radius: 4px;
        ">
          <strong>Error rendering HTML:</strong> \${error}
        </div>
      \`;
    }
  }, [data, config]);

  // Execute any scripts in the generated HTML safely
  useEffect(() => {
    if (containerRef.current && htmlContent) {
      // Find and execute script tags
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach((script) => {
        try {
          if (script.textContent) {
            // Create a new script element to execute
            const newScript = document.createElement('script');
            if (script.src) {
              newScript.src = script.src;
            } else {
              newScript.textContent = script.textContent;
            }
            document.head.appendChild(newScript);
            document.head.removeChild(newScript);
          }
        } catch (error) {
          console.warn('Could not execute script:', error);
        }
      });
    }
  }, [htmlContent]);
  
  // If we have a JSX component, render it directly
  if (jsxComponent) {
    const JsxComponent = jsxComponent;
    return (
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          padding: '16px',
          minHeight: '200px'
        }}
      >
        <JsxComponent data={data} />
      </div>
    );
  }

  // Otherwise render HTML content
  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        padding: '16px',
        minHeight: '200px'
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

const generateFallbackHtml = (data: any, config: any): string => {
  console.log('Generating fallback HTML', { data, config });
  const title = config?.title || 'HTML Visualization';
  
  // Add a test HTML block to verify rendering works
  const testHtml = \`
    <div style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); padding: 20px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🎨 HTML Renderer Test</h2>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">This confirms HTML rendering is working!</p>
    </div>
  \`;
  
  console.log('Test HTML generated:', testHtml);
  
  // Try to create a simple visualization from the data
  if (Array.isArray(data?.data) && data.data.length > 0) {
    const headers = [
      ...(data.rowHeaders || []).map((h: any) => h.label || h.name || 'Dimension'),
      ...(data.measureHeaders || []).map((h: any) => h.label || h.name || 'Measure')
    ];
    
    const rows = data.data.slice(0, 10).map((row: any[]) => {
      const cells = row.map((cell, index) => {
        const value = cell?.formatted ?? cell?.value ?? '';
        return \`<td style="padding: 8px; border-bottom: 1px solid #eee;">\${value}</td>\`;
      }).join('');
      return \`<tr>\${cells}</tr>\`;
    }).join('');
    
    const headerRow = headers.map(header => 
      \`<th style="padding: 8px; background: #f8f9fa; border-bottom: 2px solid #dee2e6; text-align: left;">\${header}</th>\`
    ).join('');
    
    return \`
      \${testHtml}
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2 style="margin: 0 0 16px 0; color: #333;">\${title}</h2>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr>\${headerRow}</tr>
            </thead>
            <tbody>
              \${rows}
            </tbody>
          </table>
        </div>
        \${data.data.length > 10 ? \`<p style="margin-top: 12px; color: #666; font-size: 14px;">Showing first 10 of \${data.totalRows || data.data.length} rows</p>\` : ''}
      </div>
    \`;
  }
  
  // Very basic fallback
  return \`
    \${testHtml}
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h2 style="margin: 0 0 16px 0; color: #333;">\${title}</h2>
    <div style="
      background: #f8f9fa; 
      padding: 16px; 
        border-radius: 8px; 
      border: 1px solid #dee2e6;
    ">
        <p style="margin: 0 0 12px 0; color: #666;">No HTML code generated. Raw data:</p>
        <pre style="
          margin: 0; 
          white-space: pre-wrap; 
          font-family: 'Monaco', 'Menlo', monospace; 
          font-size: 12px;
          background: white;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
        ">\${JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  \`;
};

// Function to create a React component from React.createElement code
const createJSXComponent = (reactCode: string, data: any): React.ComponentType<any> => {
  console.log('Creating React component from code:', reactCode);
  
  try {
    // Create a function that evaluates the React component code directly (no cleaning/modification)
    const componentFactory = new Function(
      'React', 
      'data',
      \`
        const { useState, useEffect, useMemo, useRef, createElement } = React;
        
        \${reactCode}
        
        return HtmlVisualization;
      \`
    );
    
    // Execute the function to get the component
    const Component = componentFactory(React, data);
    
    console.log('Generated component:', Component);
    console.log('Component type:', typeof Component);
    
    if (typeof Component !== 'function') {
      throw new Error(\`Generated code did not return a function component. Got: \${typeof Component}\`);
    }
    
    console.log('Successfully created React component:', Component);
    return Component;
    
  } catch (error: any) {
    console.error('Error creating React component:', error);
    
    // Fallback: create a simple component that shows the error and code
    return ({ data }: { data: any }) => (
      <div style={{ 
        background: '#fff3cd', 
        border: '1px solid #ffeeba', 
        color: '#856404', 
        padding: '12px', 
        margin: '10px 0',
        borderRadius: '4px'
      }}>
        <h4>React Component Error</h4>
        <p>{error.message}</p>
        <details>
          <summary>Generated Code</summary>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto'
          }}>
            {reactCode}
          </pre>
        </details>
      </div>
    );
  }
};
`;
};

module.exports = htmlRendererGenerator;



import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Sparkles } from 'lucide-react';
import { getReportHtml } from '../../services/api';

const ReportTab = ({ datasetId, targetCol }) => {
  const [reportHtml, setReportHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (datasetId && !reportHtml) {
      setLoading(true);
      getReportHtml(datasetId, targetCol)
        .then((res) => {
          if (res?.html) setReportHtml(res.html);
        })
        .catch((e) => console.error('Report fetch err:', e))
        .finally(() => setLoading(false));
    }
  }, [datasetId, targetCol]);

  const handleDownloadReport = () => {
    if (!reportHtml) return;
    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DataLens-AI-Intelligence-Report-${datasetId || 'summary'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="text-sm font-bold text-white">
              Comprehensive Dataset Intelligence Research Document
            </h3>
            <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
              Standalone Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Formatted as a rigorous data science thesis report with 4-pillar quality scores, statistical distributions, correlation matrices, and AutoML findings.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={!reportHtml || loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-all min-h-[40px] disabled:opacity-50 active:scale-95"
            title="Download full standalone HTML report"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download HTML Report</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const iframe = document.getElementById('report-iframe');
              if (iframe) iframe.contentWindow.print();
            }}
            disabled={!reportHtml || loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer transition-all min-h-[40px] disabled:opacity-50 active:scale-95"
            title="Print or export as PDF"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Iframe Preview Container */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl min-h-[500px] sm:min-h-[750px] w-full relative">
        {loading ? (
          <div className="p-12 sm:p-16 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
            <span>Compiling mathematical summaries, distributions & AutoML metrics...</span>
          </div>
        ) : (
          <iframe
            id="report-iframe"
            srcDoc={reportHtml}
            title="DataLens AI Intelligence Report Preview"
            className="w-full min-h-[500px] sm:min-h-[750px] border-none bg-slate-950"
          />
        )}
      </div>
    </div>
  );
};

export default ReportTab;

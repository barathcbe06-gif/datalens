import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { getReportHtml, getReportDownloadUrl } from '../../services/api';

const ReportTab = ({ datasetId, targetCol }) => {
  const [reportHtml, setReportHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (datasetId && !reportHtml) {
      setLoading(true);
      getReportHtml(datasetId, targetCol)
        .then((res) => setReportHtml(res.html))
        .catch((e) => console.error('Report fetch err:', e))
        .finally(() => setLoading(false));
    }
  }, [datasetId, targetCol]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 backdrop-blur-md shadow-lg flex flex-wrap items-center justify-between gap-4 font-mono">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Comprehensive 13-Section Dataset Intelligence Report
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Formatted as a postgraduate-level data science thesis document ready for print, PDF export, or web distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getReportDownloadUrl(datasetId, targetCol)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </a>
          <button
            onClick={() => {
              const iframe = document.getElementById('report-iframe');
              if (iframe) iframe.contentWindow.print();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Iframe Preview */}
      <div className="bg-white rounded-2xl border border-slate-800 overflow-hidden shadow-2xl min-h-[750px]">
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-mono text-xs">
            Compiling and rendering 13-section research report...
          </div>
        ) : (
          <iframe
            id="report-iframe"
            srcDoc={reportHtml}
            title="DataLens AI Intelligence Report Preview"
            className="w-full min-h-[750px] border-none"
          />
        )}
      </div>
    </div>
  );
};

export default ReportTab;

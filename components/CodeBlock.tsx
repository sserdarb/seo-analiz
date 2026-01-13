import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'html', title }) => {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 font-mono text-sm mt-4">
      {title && (
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 text-gray-400 text-xs flex justify-between items-center">
          <span>{title}</span>
          <span className="uppercase">{language}</span>
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <pre className="text-gray-300 whitespace-pre-wrap break-all">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
'use client';

import React from 'react';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';

interface CodingEditorProps {
  initialCode: string;
  language: string;
  onCodeChange: (code: string) => void;
}

const CodingEditor: React.FC<CodingEditorProps> = ({ initialCode, language, onCodeChange }) => {
  const handleEditorChange: OnChange = (value) => {
    onCodeChange(value || '');
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // You can add custom editor configurations here
    editor.focus();
  };

  return (
    <div className="h-full w-full border border-gray-700 rounded-md overflow-hidden">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={initialCode}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CodingEditor;

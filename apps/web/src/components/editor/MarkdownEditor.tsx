import { useState, useMemo } from 'react';
import { marked } from 'marked';

// Basic markdown config
marked.setOptions({ breaks: true, gfm: true });

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function MarkdownEditor({ value, onChange, placeholder, minHeight = 400 }: Props) {
  const [tab, setTab] = useState<'edit' | 'split' | 'preview'>('split');

  const html = useMemo(() => {
    if (!value) return '<p style="color:var(--text-muted)">暂无内容</p>';
    try { return marked(value) as string; } catch { return '<p style="color:var(--red)">Markdown 解析错误</p>'; }
  }, [value]);

  const tabBtn = (t: typeof tab, label: string) => ({
    padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: t === tab ? 600 : 400,
    cursor: 'pointer', border: 'none', background: t === tab ? 'var(--bg-hover)' : 'transparent',
    color: t === tab ? 'var(--text-strong)' : 'var(--text-muted)', transition: 'all .15s',
  });

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 2, padding: '8px 12px', background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
        <button type="button" style={tabBtn('edit', '编辑')} onClick={() => setTab('edit')}>编辑</button>
        <button type="button" style={tabBtn('split', '分屏')} onClick={() => setTab('split')}>分屏</button>
        <button type="button" style={tabBtn('preview', '预览')} onClick={() => setTab('preview')}>预览</button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>支持 Markdown 语法</span>
      </div>

      {/* Editor + Preview */}
      <div style={{ display: 'flex', minHeight }}>
        {(tab === 'edit' || tab === 'split') && (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || '输入 Markdown 内容...'}
            style={{
              flex: tab === 'split' ? 1 : undefined,
              width: tab === 'edit' ? '100%' : undefined,
              padding: '16px', border: 'none', borderRight: tab === 'split' ? '1px solid var(--border)' : 'none',
              resize: 'vertical', outline: 'none', fontSize: 15, lineHeight: 1.7,
              fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace",
              background: 'var(--bg-input)', color: 'var(--text-body)',
            }}
          />
        )}
        {(tab === 'preview' || tab === 'split') && (
          <div
            style={{
              flex: tab === 'split' ? 1 : undefined,
              width: tab === 'preview' ? '100%' : undefined,
              padding: '16px 20px', overflow: 'auto', fontSize: 15, lineHeight: 1.8,
              color: 'var(--text-body)',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}
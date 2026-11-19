import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
  block?: boolean;
}

interface Segment {
  type: 'text' | 'inline' | 'display';
  content: string;
}

function parseMathSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;
  const n = input.length;
  let buffer = '';

  const flushText = () => {
    if (buffer) {
      segments.push({ type: 'text', content: buffer });
      buffer = '';
    }
  };

  while (i < n) {
    if (input[i] === '$' && input[i + 1] === '$') {
      const end = input.indexOf('$$', i + 2);
      if (end !== -1) {
        flushText();
        segments.push({ type: 'display', content: input.slice(i + 2, end).trim() });
        i = end + 2;
        continue;
      }
    }
    if (input[i] === '$') {
      const end = input.indexOf('$', i + 1);
      if (end !== -1 && end > i + 1) {
        flushText();
        segments.push({ type: 'inline', content: input.slice(i + 1, end).trim() });
        i = end + 1;
        continue;
      }
    }
    buffer += input[i];
    i += 1;
  }
  flushText();
  return segments;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '', block = false }) => {
  const parts = useMemo(() => parseMathSegments(text ?? ''), [text]);

  const Container = block ? 'div' : 'span';

  return (
    <Container className={className}>
      {parts.map((seg, idx) => {
        if (seg.type === 'text') {
          return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
        }
        const html = katex.renderToString(seg.content, {
          displayMode: seg.type === 'display',
          throwOnError: false,
          strict: false,
          trust: false,
          output: 'html',
        });
        if (seg.type === 'display') {
          return (
            <span
              key={idx}
              className="block my-2 overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return (
          <span
            key={idx}
            className="inline-block align-baseline mx-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </Container>
  );
};

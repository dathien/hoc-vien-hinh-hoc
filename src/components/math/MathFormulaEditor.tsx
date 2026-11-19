import React, { useState } from 'react';
import { Check, Delete, RotateCcw, Trash2, X } from 'lucide-react';
import { MathText } from './MathText';

interface FormulaToken {
  id: string;
  latex: string;
  label: string;
}

interface TemplateButton {
  label: string;
  previewLatex: string;
  insertLatex: string;
  needsParams?: Array<{ key: string; label: string; placeholder: string; defaultVal: string }>;
  buildLatex?: (vals: Record<string, string>) => string;
}

const CATEGORIES: Array<{ id: string; name: string; items: TemplateButton[] }> = [
  {
    id: 'geometry',
    name: 'Hình học',
    items: [
      {
        label: 'Đoạn thẳng',
        previewLatex: '\\overline{AB}',
        insertLatex: '\\overline{AB}',
        needsParams: [{ key: 'p', label: 'Hai đầu mút', placeholder: 'AB', defaultVal: 'AB' }],
        buildLatex: (v) => `\\overline{${v.p || 'AB'}}`,
      },
      {
        label: 'Tia',
        previewLatex: '\\overrightarrow{Ox}',
        insertLatex: '\\overrightarrow{Ox}',
        needsParams: [{ key: 'p', label: 'Tên tia', placeholder: 'Ox', defaultVal: 'Ox' }],
        buildLatex: (v) => `\\overrightarrow{${v.p || 'Ox'}}`,
      },
      {
        label: 'Vectơ',
        previewLatex: '\\overrightarrow{AB}',
        insertLatex: '\\overrightarrow{AB}',
        needsParams: [{ key: 'p', label: 'Điểm đầu – cuối', placeholder: 'AB', defaultVal: 'AB' }],
        buildLatex: (v) => `\\overrightarrow{${v.p || 'AB'}}`,
      },
      {
        label: 'Góc',
        previewLatex: '\\widehat{ABC}',
        insertLatex: '\\widehat{ABC}',
        needsParams: [{ key: 'p', label: 'Tên góc', placeholder: 'ABC', defaultVal: 'ABC' }],
        buildLatex: (v) => `\\widehat{${v.p || 'ABC'}}`,
      },
      {
        label: 'Tam giác',
        previewLatex: '\\triangle ABC',
        insertLatex: '\\triangle ABC',
        needsParams: [{ key: 'p', label: 'Ba đỉnh', placeholder: 'ABC', defaultVal: 'ABC' }],
        buildLatex: (v) => `\\triangle ${v.p || 'ABC'}`,
      },
      {
        label: 'Cung tròn',
        previewLatex: '\\overset{\\frown}{AB}',
        insertLatex: '\\overset{\\frown}{AB}',
        needsParams: [{ key: 'p', label: 'Hai đầu cung', placeholder: 'AB', defaultVal: 'AB' }],
        buildLatex: (v) => `\\overset{\\frown}{${v.p || 'AB'}}`,
      },
      { label: 'Vuông góc', previewLatex: '\\perp', insertLatex: ' \\perp ' },
      { label: 'Song song', previewLatex: '\\parallel', insertLatex: ' \\parallel ' },
      { label: 'Đồng dạng', previewLatex: '\\sim', insertLatex: ' \\sim ' },
      { label: 'Góc vuông', previewLatex: '90^\\circ', insertLatex: '90^\\circ' },
      { label: 'Độ', previewLatex: '^\\circ', insertLatex: '^\\circ' },
    ],
  },
  {
    id: 'spatial3d',
    name: 'Không gian 3D & Oxyz',
    items: [
      {
        label: 'Tọa độ 3D',
        previewLatex: '(x; y; z)',
        insertLatex: '(x; y; z)',
        needsParams: [
          { key: 'x', label: 'Hoành độ x', placeholder: '1', defaultVal: '1' },
          { key: 'y', label: 'Tung độ y', placeholder: '2', defaultVal: '2' },
          { key: 'z', label: 'Cao độ z', placeholder: '3', defaultVal: '3' },
        ],
        buildLatex: (v) => `(${v.x || 'x'}; ${v.y || 'y'}; ${v.z || 'z'})`,
      },
      {
        label: 'Mặt phẳng (P)',
        previewLatex: '(P)',
        insertLatex: '(P)',
        needsParams: [{ key: 'p', label: 'Tên mặt phẳng', placeholder: 'P', defaultVal: 'P' }],
        buildLatex: (v) => `(${v.p || 'P'})`,
      },
      {
        label: 'Hình chóp',
        previewLatex: 'S.ABCD',
        insertLatex: 'S.ABCD',
        needsParams: [
          { key: 's', label: 'Đỉnh', placeholder: 'S', defaultVal: 'S' },
          { key: 'b', label: 'Đáy', placeholder: 'ABCD', defaultVal: 'ABCD' },
        ],
        buildLatex: (v) => `${v.s || 'S'}.${v.b || 'ABCD'}`,
      },
      {
        label: 'Khoảng cách',
        previewLatex: 'd(A,(P))',
        insertLatex: 'd(A, (P))',
        needsParams: [
          { key: 'a', label: 'Đối tượng 1', placeholder: 'A', defaultVal: 'A' },
          { key: 'b', label: 'Đối tượng 2', placeholder: '(P)', defaultVal: '(P)' },
        ],
        buildLatex: (v) => `d(${v.a || 'A'}, ${v.b || '(P)'})`,
      },
      {
        label: 'Tích có hướng',
        previewLatex: '[\\vec{u}, \\vec{v}]',
        insertLatex: '[\\vec{u}, \\vec{v}]',
        needsParams: [
          { key: 'u', label: 'Vectơ thứ nhất', placeholder: 'u', defaultVal: 'u' },
          { key: 'v', label: 'Vectơ thứ hai', placeholder: 'v', defaultVal: 'v' },
        ],
        buildLatex: (v) => `[\\vec{${v.u || 'u'}}, \\vec{${v.v || 'v'}}]`,
      },
      {
        label: 'Hệ phương trình',
        previewLatex: '\\begin{cases}x\\\\y\\end{cases}',
        insertLatex: '\\begin{cases} x = t \\\\ y = t \\\\ z = t \\end{cases}',
        needsParams: [
          { key: 'e1', label: 'Phương trình 1', placeholder: 'x = 1 + t', defaultVal: 'x = 1 + t' },
          { key: 'e2', label: 'Phương trình 2', placeholder: 'y = 2 - t', defaultVal: 'y = 2 - t' },
          { key: 'e3', label: 'Phương trình 3', placeholder: 'z = 3t', defaultVal: 'z = 3t' },
        ],
        buildLatex: (v) => `\\begin{cases} ${v.e1 || 'x = t'} \\\\ ${v.e2 || 'y = t'} \\\\ ${v.e3 || 'z = t'} \\end{cases}`,
      },
      { label: 'Thuộc', previewLatex: '\\in', insertLatex: ' \\in ' },
      { label: 'Không thuộc', previewLatex: '\\notin', insertLatex: ' \\notin ' },
      { label: 'Chứa trong', previewLatex: '\\subset', insertLatex: ' \\subset ' },
      { label: 'Giao nhau', previewLatex: '\\cap', insertLatex: ' \\cap ' },
      { label: 'Vectơ pháp tuyến', previewLatex: '\\vec{n}', insertLatex: '\\vec{n}' },
      { label: 'Vectơ chỉ phương', previewLatex: '\\vec{u}', insertLatex: '\\vec{u}' },
    ],
  },
  {
    id: 'basic',
    name: 'Biểu thức cơ bản',
    items: [
      {
        label: 'Phân số',
        previewLatex: '\\frac{a}{b}',
        insertLatex: '\\frac{a}{b}',
        needsParams: [
          { key: 'num', label: 'Tử số', placeholder: '1', defaultVal: '1' },
          { key: 'den', label: 'Mẫu số', placeholder: '2', defaultVal: '2' },
        ],
        buildLatex: (v) => `\\frac{${v.num || 'a'}}{${v.den || 'b'}}`,
      },
      {
        label: 'Căn bậc hai',
        previewLatex: '\\sqrt{x}',
        insertLatex: '\\sqrt{x}',
        needsParams: [{ key: 'x', label: 'Biểu thức trong căn', placeholder: 'ab', defaultVal: '2' }],
        buildLatex: (v) => `\\sqrt{${v.x || 'x'}}`,
      },
      {
        label: 'Căn bậc n',
        previewLatex: '\\sqrt[n]{x}',
        insertLatex: '\\sqrt[3]{x}',
        needsParams: [
          { key: 'n', label: 'Bậc căn', placeholder: '3', defaultVal: '3' },
          { key: 'x', label: 'Biểu thức', placeholder: 'x', defaultVal: 'x' },
        ],
        buildLatex: (v) => `\\sqrt[${v.n || 'n'}]{${v.x || 'x'}}`,
      },
      {
        label: 'Lũy thừa',
        previewLatex: 'a^n',
        insertLatex: 'a^2',
        needsParams: [
          { key: 'base', label: 'Cơ số', placeholder: 'AB', defaultVal: 'AB' },
          { key: 'exp', label: 'Số mũ', placeholder: '2', defaultVal: '2' },
        ],
        buildLatex: (v) => `${v.base || 'a'}^{${v.exp || '2'}}`,
      },
      {
        label: 'Chỉ số dưới',
        previewLatex: 'A_1',
        insertLatex: 'A_1',
        needsParams: [
          { key: 'base', label: 'Ký hiệu', placeholder: 'O', defaultVal: 'O' },
          { key: 'sub', label: 'Chỉ số', placeholder: '1', defaultVal: '1' },
        ],
        buildLatex: (v) => `${v.base || 'A'}_{${v.sub || '1'}}`,
      },
      {
        label: 'Trị tuyệt đối',
        previewLatex: '|x|',
        insertLatex: '|x|',
        needsParams: [{ key: 'x', label: 'Biểu thức', placeholder: 'k', defaultVal: 'k' }],
        buildLatex: (v) => `|${v.x || 'x'}|`,
      },
      { label: 'Cộng', previewLatex: '+', insertLatex: ' + ' },
      { label: 'Trừ', previewLatex: '-', insertLatex: ' - ' },
      { label: 'Nhân', previewLatex: '\\cdot', insertLatex: ' \\cdot ' },
      { label: 'Ngoặc tròn', previewLatex: '(\\dots)', insertLatex: '()' },
    ],
  },
  {
    id: 'relations',
    name: 'So sánh & Hằng số',
    items: [
      { label: 'Bằng', previewLatex: '=', insertLatex: ' = ' },
      { label: 'Khác', previewLatex: '\\neq', insertLatex: ' \\neq ' },
      { label: 'Nhỏ hơn bằng', previewLatex: '\\le', insertLatex: ' \\le ' },
      { label: 'Lớn hơn bằng', previewLatex: '\\ge', insertLatex: ' \\ge ' },
      { label: 'Xấp xỉ', previewLatex: '\\approx', insertLatex: ' \\approx ' },
      { label: 'Suy ra', previewLatex: '\\Rightarrow', insertLatex: ' \\Rightarrow ' },
      { label: 'Tương đương', previewLatex: '\\Leftrightarrow', insertLatex: ' \\Leftrightarrow ' },
      { label: 'Số Pi', previewLatex: '\\pi', insertLatex: '\\pi' },
      { label: 'Tỉ lệ vàng', previewLatex: '\\varphi', insertLatex: '\\varphi' },
      { label: 'Thuộc', previewLatex: '\\in', insertLatex: ' \\in ' },
      { label: 'Không thuộc', previewLatex: '\\notin', insertLatex: ' \\notin ' },
      { label: 'Giao', previewLatex: '\\cap', insertLatex: ' \\cap ' },
      { label: 'Hợp', previewLatex: '\\cup', insertLatex: ' \\cup ' },
    ],
  },
  {
    id: 'symbols',
    name: 'Điểm & Số nhanh',
    items: [
      ...['A', 'B', 'C', 'D', 'M', 'N', 'O', 'P', 'H', 'G', 'I', 'R', 'r'].map((ch) => ({
        label: ch,
        previewLatex: ch,
        insertLatex: ch,
      })),
      ...['0', '1', '2', '3', '4', '5', '6', '90^\\circ', '60^\\circ', '45^\\circ', '30^\\circ'].map(
        (num) => ({
          label: num.replace('^\\circ', '°'),
          previewLatex: num,
          insertLatex: num,
        })
      ),
    ],
  },
];

interface MathFormulaEditorProps {
  initialFormula?: string;
  onApply: (wrappedInlineFormula: string) => void;
  onCancel?: () => void;
}

export const MathFormulaEditor: React.FC<MathFormulaEditorProps> = ({
  initialFormula = '',
  onApply,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<string>('geometry');
  const [tokens, setTokens] = useState<FormulaToken[]>(() => {
    const clean = initialFormula.replace(/^\$+/, '').replace(/\$+$/, '').trim();
    return clean ? [{ id: 'init', latex: clean, label: clean }] : [];
  });
  const [pendingTemplate, setPendingTemplate] = useState<TemplateButton | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  const combinedLatex = tokens.map((t) => t.latex).join('');

  const handleSelectItem = (item: TemplateButton) => {
    if (item.needsParams && item.buildLatex) {
      const defaults: Record<string, string> = {};
      for (const p of item.needsParams) {
        defaults[p.key] = p.defaultVal;
      }
      setParamValues(defaults);
      setPendingTemplate(item);
      return;
    }
    setTokens((prev) => [
      ...prev,
      { id: `t_${Date.now()}_${Math.random()}`, latex: item.insertLatex, label: item.label },
    ]);
  };

  const confirmPending = () => {
    if (!pendingTemplate || !pendingTemplate.buildLatex) return;
    const built = pendingTemplate.buildLatex(paramValues);
    setTokens((prev) => [
      ...prev,
      { id: `t_${Date.now()}_${Math.random()}`, latex: built, label: pendingTemplate.label },
    ]);
    setPendingTemplate(null);
  };

  const removeLastToken = () => {
    setTokens((prev) => prev.slice(0, -1));
  };

  const clearAll = () => {
    setTokens([]);
    setPendingTemplate(null);
  };

  const activeCategory = CATEGORIES.find((c) => c.id === activeTab) ?? CATEGORIES[0];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Trình soạn công thức Toán học trực quan
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nhấp chọn các khối ký hiệu bên dưới — không cần gõ mã lệnh kỹ thuật.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Đóng trình soạn công thức"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Live Preview Box */}
      <div className="min-h-[68px] rounded-xl border border-teal-200 dark:border-teal-800/70 bg-teal-50/40 dark:bg-slate-800/70 px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-xl text-slate-900 dark:text-slate-100 overflow-x-auto">
          {combinedLatex ? (
            <MathText text={`$${combinedLatex}$`} />
          ) : (
            <span className="text-sm text-slate-400 italic">
              Bản xem trước công thức sẽ hiện ngay tại đây...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={removeLastToken}
            disabled={tokens.length === 0}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
            title="Xóa thành phần vừa thêm"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={tokens.length === 0}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40"
            title="Xóa toàn bộ công thức"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Token chips for clickable removal */}
      {tokens.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-slate-500 dark:text-slate-400 mr-1">Thành phần:</span>
          {tokens.map((tok, i) => (
            <button
              key={tok.id}
              type="button"
              onClick={() => setTokens((prev) => prev.filter((_, idx) => idx !== i))}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 transition-colors"
              title="Nhấp để bỏ thành phần này"
            >
              <MathText text={`$${tok.latex}$`} />
              <X className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* Parameter input prompt for structured templates */}
      {pendingTemplate && pendingTemplate.needsParams && (
        <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-3 space-y-3">
          <div className="text-sm font-medium text-sky-900 dark:text-sky-200">
            Nhập giá trị cho mẫu <span className="font-semibold">{pendingTemplate.label}</span>:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingTemplate.needsParams.map((param) => (
              <label key={param.key} className="block space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {param.label}
                </span>
                <input
                  type="text"
                  value={paramValues[param.key] ?? ''}
                  onChange={(e) =>
                    setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))
                  }
                  placeholder={param.placeholder}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </label>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingTemplate(null)}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
            >
              Hủy mẫu
            </button>
            <button
              type="button"
              onClick={confirmPending}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-sky-600 text-white hover:bg-sky-700"
            >
              Chèn vào công thức
            </button>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveTab(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === cat.id
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Visual buttons grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {activeCategory.items.map((item, idx) => (
          <button
            key={`${activeCategory.id}_${idx}`}
            type="button"
            onClick={() => handleSelectItem(item)}
            className="min-h-[48px] flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:border-teal-500 hover:bg-teal-50/60 dark:hover:bg-teal-950/30 px-2 py-1.5 transition-colors"
            title={item.label}
          >
            <span className="text-base text-slate-900 dark:text-slate-100">
              <MathText text={`$${item.previewLatex}$`} />
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-full">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Action footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
          Làm mới
        </button>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
          )}
          <button
            type="button"
            disabled={!combinedLatex}
            onClick={() => onApply(`$${combinedLatex}$`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 disabled:opacity-45"
          >
            <Check className="w-4 h-4" />
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

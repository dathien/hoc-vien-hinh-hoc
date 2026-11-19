import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  ChevronRight,
  Compass,
  Download,
  GraduationCap,
  HardDrive,
  HelpCircle,
  Lightbulb,
  MapPin,
  PenTool,
  Play,
  Ruler,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { useApp } from '../store/AppContext';

type GuideIllustrationId =
  | 'interface'
  | 'straightedge'
  | 'compass'
  | 'points'
  | 'first-challenge'
  | 'verify'
  | 'hints'
  | 'lab'
  | 'classroom'
  | 'achievements'
  | 'export'
  | 'backup';

interface GuideGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  steps: string[];
  tip: string;
  illustration: GuideIllustrationId;
  actionLabel: string;
  actionType: 'page' | 'challenge' | 'tour';
  actionTarget: string;
}

const GUIDE_GROUPS: GuideGroup[] = [
  {
    id: 'guide-1',
    number: 1,
    title: 'Làm quen với giao diện',
    summary:
      'Thanh điều hướng phía trên giúp bạn di chuyển nhanh giữa các khu vực học tập chính mà không cần đăng nhập.',
    steps: [
      'Trang chủ: xem tổng quan tiến độ học tập, số sao đạt được và mở nhanh bài thử thách đang học dở.',
      'Thử thách: hệ thống 18 cấp độ với 180 bài dựng hình sắp xếp từ cơ bản đến nâng cao và Olympic.',
      'Phòng thực hành: bảng vẽ hình học tự do có đầy đủ công cụ để tự vẽ, đo đạc và khám phá.',
      'Theo lớp · Đấu trường · Thư viện · Mở rộng: học theo khối lớp, tổ chức thi đua, tra cứu kiến thức và mở các tiện ích hỗ trợ.',
    ],
    tip: 'Nếu cần xem lại nhanh các khu vực chính ngay trên màn hình, bạn có thể nhấn nút "Mở hướng dẫn tương tác" ở đầu trang.',
    illustration: 'interface',
    actionLabel: 'Về Trang chủ',
    actionType: 'page',
    actionTarget: 'home',
  },
  {
    id: 'guide-2',
    number: 2,
    title: 'Sử dụng thước thẳng',
    summary:
      'Thước thẳng không chia độ dùng để nối hai điểm đã biết thành đoạn thẳng, đường thẳng kéo dài hoặc tia.',
    steps: [
      'Chọn một trong ba công cụ: Đoạn thẳng, Đường thẳng hoặc Tia trên thanh công cụ dựng hình.',
      'Nhấp chọn điểm thứ nhất làm điểm đi qua (vòng sáng bắt dính sẽ hiện lên khi con trỏ chạm đúng điểm).',
      'Di chuyển con trỏ đến điểm thứ hai rồi nhấp chuột để hoàn tất đường nối.',
      'Bạn có thể bật chế độ "Thước & Compa ảo" ngay trên thanh công cụ để quan sát thước thẳng đặt trực tiếp lên hai điểm.',
    ],
    tip: 'Đường thẳng kéo dài vô hạn hai phía rất hữu ích để tìm giao điểm với các đường tròn hoặc đường thẳng khác.',
    illustration: 'straightedge',
    actionLabel: 'Thực hành với thước thẳng',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-3',
    number: 3,
    title: 'Sử dụng compa',
    summary:
      'Compa dùng để vẽ đường tròn biết tâm và một điểm trên đường tròn, hoặc sao chép độ dài một đoạn thẳng sang vị trí khác.',
    steps: [
      'Chọn công cụ "Đường tròn" trên thanh công cụ cơ bản.',
      'Nhấp vào điểm làm tâm đường tròn trước, sau đó di chuyển chuột ra ngoài để mở độ rộng compa.',
      'Nhấp vào một điểm sẵn có (hoặc điểm mới) để xác định bán kính của đường tròn.',
      'Khi cần giữ nguyên bán kính của một đoạn thẳng có sẵn, chọn công cụ "Sao chép độ dài": chọn hai đầu mút đoạn mẫu rồi chọn điểm tâm mới.',
    ],
    tip: 'Dùng hai đường tròn có cùng bán kính đặt tâm tại hai đầu mút A và B là bước khởi đầu quen thuộc để dựng tam giác đều và đường trung trực.',
    illustration: 'compass',
    actionLabel: 'Thực hành vẽ đường tròn',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-4',
    number: 4,
    title: 'Tạo điểm và giao điểm',
    summary:
      'Điểm là đối tượng cơ sở của mọi phép dựng. Đặt giao điểm chính xác giúp hình giữ nguyên tính chất khi kéo thả.',
    steps: [
      'Chọn công cụ "Tạo điểm" để chấm điểm tự do trên mặt phẳng hoặc chọn "Điểm trên đối tượng" để gắn điểm chạy dọc theo một đường thẳng hay đường tròn.',
      'Chọn công cụ "Tạo giao điểm" để xác định giao điểm giữa hai đường thẳng, giữa đường thẳng và đường tròn, hoặc giữa hai đường tròn.',
      'Nhấp vào đối tượng thứ nhất rồi nhấp vào đối tượng thứ hai (hoặc nhấp trực tiếp ngay tại chỗ hai nét cắt nhau khi thấy vòng sáng bắt dính).',
      'Chuyển sang công cụ "Chọn và di chuyển" để kéo thử các điểm tự do và quan sát các giao điểm tự động chạy theo.',
    ],
    tip: 'Luôn dùng công cụ "Tạo giao điểm" hoặc nhấp đúng lúc vòng bắt dính sáng lên — không ước lượng giao điểm bằng mắt thường.',
    illustration: 'points',
    actionLabel: 'Mở Phòng thực hành',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-5',
    number: 5,
    title: 'Thực hiện thử thách đầu tiên',
    summary:
      'Mỗi thử thách cung cấp sẵn hình đề bài, giả thiết rõ ràng và bộ công cụ phù hợp để bạn tự tay dựng hình.',
    steps: [
      'Mở mục "Thử thách", chọn Cấp độ I – Dựng hình cơ bản và bắt đầu từ Bài 1: Dựng tam giác đều trên đoạn thẳng AB.',
      'Đọc kỹ khung đề bài gồm Giả thiết, Yêu cầu dựng hình và Công cụ được phép sử dụng.',
      'Dùng công cụ Đường tròn vẽ đường tròn tâm A đi qua B, sau đó vẽ đường tròn tâm B đi qua A.',
      'Tạo giao điểm C của hai đường tròn rồi dùng công cụ Đoạn thẳng nối CA và CB để hoàn thành tam giác đều ABC.',
    ],
    tip: 'Hoàn thành bài hiện tại với ít nhất 1 sao sẽ tự động mở khóa bài kế tiếp trong lộ trình 180 thử thách.',
    illustration: 'first-challenge',
    actionLabel: 'Làm thử thách đầu tiên ngay',
    actionType: 'challenge',
    actionTarget: 'L01_C01',
  },
  {
    id: 'guide-6',
    number: 6,
    title: 'Kiểm chứng phép dựng',
    summary:
      'Nút "Kiểm chứng" kiểm tra tính đúng đắn hình học bằng cách tự động di chuyển các điểm giả thiết qua nhiều vị trí khác nhau.',
    steps: [
      'Sau khi dựng xong đối tượng theo yêu cầu đề bài, nhấn nút "Kiểm chứng" màu xanh ngọc ở góc trên bên phải bảng vẽ.',
      'Hệ thống sẽ lần lượt thay đổi vị trí các điểm ban đầu và kiểm tra xem hình bạn dựng có giữ nguyên tính chất toán học ở mọi vị trí hay không.',
      'Nếu đúng ở mọi cấu hình, bạn nhận Sao 1 (Dựng hình chính xác), cùng Sao 2 nếu tối ưu số bước dựng (L) và Sao 3 nếu tối ưu số phép dựng cơ bản (E).',
      'Nếu hình chỉ đúng ở một vị trí cố định do đặt điểm ước lượng, hệ thống sẽ báo cụ thể nguyên nhân để bạn điều chỉnh lại cách dựng.',
    ],
    tip: 'Trước khi nhấn "Kiểm chứng", bạn có thể tự dùng công cụ "Chọn và di chuyển" kéo thử điểm giả thiết để kiểm tra xem hình có bị lệch không.',
    illustration: 'verify',
    actionLabel: 'Vào khu vực Thử thách',
    actionType: 'page',
    actionTarget: 'campaign',
  },
  {
    id: 'guide-7',
    number: 7,
    title: 'Xem gợi ý và lời giải',
    summary:
      'Khi gặp bài khó, bạn có thể mở từng mức gợi ý tăng dần hoặc xem hoạt ảnh lời giải từng bước kèm phần giải thích toán học.',
    steps: [
      'Ở bảng bên phải màn hình thử thách, mở mục "Gợi ý theo 3 mức" và nhấn xem lần lượt từ Mức 1 (Định hướng suy nghĩ), Mức 2 (Phương pháp dựng) đến Mức 3 (Thao tác cụ thể).',
      'Nếu vẫn cần tham khảo đầy đủ, nhấn nút "Xem lời giải" để mở trình phát lời giải từng bước.',
      'Trong trình phát lời giải, dùng các nút Bắt đầu, Bước trước, Bước tiếp theo, Tạm dừng, Làm lại, Tốc độ hoặc Toàn màn hình để theo dõi rõ từng nét dựng.',
      'Đọc phần "Chứng minh và nhận xét toán học" bên dưới để hiểu vì sao phép dựng luôn đúng trong trường hợp tổng quát.',
    ],
    tip: 'Lượt làm có mở lời giải chỉ dùng để tham khảo học tập. Hãy bấm "Làm lại" và tự tay dựng lại để ghi nhận sao cho bài đó.',
    illustration: 'hints',
    actionLabel: 'Tra cứu Thư viện kiến thức',
    actionType: 'page',
    actionTarget: 'library',
  },
  {
    id: 'guide-8',
    number: 8,
    title: 'Sử dụng phòng thực hành',
    summary:
      'Phòng thực hành mở toàn bộ công cụ dựng hình cơ bản, công cụ hỗ trợ, phép biến hình và đo đạc để bạn tự do sáng tạo.',
    steps: [
      'Mở mục "Phòng thực hành" trên thanh điều hướng để bắt đầu một trang vẽ mới hoặc mở lại các bản vẽ đã lưu.',
      'Chọn công cụ ở nhóm Cơ bản (điểm, đường thẳng, đường tròn) hoặc nhóm Hỗ trợ (trung điểm, đường trung trực, song song, phân giác, đo độ dài, đo góc).',
      'Nhấp vào một đối tượng để đổi màu nét, kiểu nét liền/nét đứt, độ dày hoặc kéo nhẹ tên nhãn điểm ra vị trí dễ nhìn mà không làm sai tọa độ.',
      'Đặt tiêu đề cho bản vẽ rồi nhấn "Lưu bản vẽ" để lưu giữ ngay trên máy tính hoặc điện thoại của bạn.',
    ],
    tip: 'Bạn có thể bật hoặc tắt lưới tọa độ và trục tọa độ ngay trên thanh công cụ của Phòng thực hành.',
    illustration: 'lab',
    actionLabel: 'Mở Phòng thực hành',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-9',
    number: 9,
    title: 'Tổ chức hoạt động trên lớp',
    summary:
      'Giáo viên có thể trình chiếu bất kỳ bài học nào, tự tạo bài tập mới và tổ chức thi đấu trực tiếp ngay tại lớp học.',
    steps: [
      'Vào "Mở rộng → Công cụ giáo viên" và bật "Chế độ Xem trước 180 bài" để mở ngay mọi thử thách phục vụ giảng dạy mà không ảnh hưởng tiến độ của học sinh.',
      'Bật "Chế độ trình chiếu" (cỡ chữ lớn) khi dạy trên tivi, máy chiếu hoặc màn hình lớn trong lớp.',
      'Dùng thẻ "Tạo thử thách mới" để tự biên soạn đề bài, chèn ký hiệu toán học, chọn công cụ cho phép và lưu sẵn cho học sinh thực hành.',
      'Vào mục "Đấu trường" để chọn thể thức Thi đấu trong lớp học, Thi đấu theo đội hoặc 1v1 và bật màn hình bảng xếp hạng trực quan.',
    ],
    tip: 'Mọi tính năng trong Công cụ giáo viên và Đấu trường hoạt động hoàn toàn miễn phí và chạy trực tiếp ngay trên trình duyệt.',
    illustration: 'classroom',
    actionLabel: 'Mở Công cụ giáo viên',
    actionType: 'page',
    actionTarget: 'teacher',
  },
  {
    id: 'guide-10',
    number: 10,
    title: 'Xem kết quả và thành tích',
    summary:
      'Theo dõi tiến độ hoàn thành 180 thử thách, tổng số sao trên thang 540 sao, huy hiệu đạt được và tải giấy chứng nhận.',
    steps: [
      'Mở mục "Mở rộng → Thành tích học tập" để xem tổng số thử thách đã vượt qua, tỷ lệ hoàn thành từng cấp độ và danh hiệu hiện tại.',
      'Theo dõi tiến độ mở khóa 12 huy hiệu tương ứng với từng kỹ năng như dựng hình cơ bản, tối ưu bước dựng, dựng hình bằng compa hay thước thẳng.',
      'Kéo xuống mục "Giấy chứng nhận thành tích" (hoặc chọn nhanh "Mở rộng → Giấy chứng nhận"), nhập họ tên học viên.',
      'Nhấn "Tải ảnh PNG (A4)" hoặc "In / Lưu PDF" để lưu lại giấy chứng nhận kết quả học tập.',
    ],
    tip: 'Bạn có thể làm lại bất kỳ thử thách cũ nào để cải thiện số bước dựng L và E nhằm đạt đủ 3 sao; hệ thống chỉ giữ lại kỷ lục tốt nhất.',
    illustration: 'achievements',
    actionLabel: 'Xem Thành tích học tập',
    actionType: 'page',
    actionTarget: 'achievements',
  },
  {
    id: 'guide-11',
    number: 11,
    title: 'Xuất hình vẽ',
    summary:
      'Lưu hình vẽ từ Phòng thực hành thành tệp ảnh sắc nét để chèn vào bài giảng, phiếu học tập hoặc báo cáo Toán học.',
    steps: [
      'Hoàn thiện hình vẽ trong Phòng thực hành, chỉnh màu sắc và vị trí nhãn điểm cho cân đối, rõ ràng.',
      'Tắt lưới tọa độ nếu bạn muốn hình vẽ có nền trắng sạch đẹp như hình minh họa trong sách giáo khoa.',
      'Nhấn nút "Xuất PNG" để tải ảnh chất lượng cao dùng ngay cho Word, PowerPoint hoặc gửi bài tập.',
      'Hoặc nhấn nút "Xuất SVG" để tải ảnh vector không bị vỡ nét khi phóng to in ấn khổ lớn.',
    ],
    tip: 'Bạn cũng có thể xuất trực tiếp Giấy chứng nhận thành tích khổ A4 ở trang Thành tích học tập.',
    illustration: 'export',
    actionLabel: 'Vẽ và xuất hình ngay',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-12',
    number: 12,
    title: 'Sao lưu dữ liệu và sử dụng ngoại tuyến',
    summary:
      'Mọi tiến độ học tập và bản vẽ được lưu an toàn trên thiết bị của bạn, có thể sao lưu sang máy khác và dùng cả khi không có mạng.',
    steps: [
      'Mở mục "Mở rộng → Sao lưu và khôi phục" (trong trang Cài đặt).',
      'Nhấn "Xuất tệp sao lưu" để tải về máy một tệp lưu toàn bộ số sao, bài đã hoàn thành, bản vẽ và danh sách lớp.',
      'Khi chuyển sang thiết bị khác hoặc cài lại trình duyệt, nhấn "Nhập & Khôi phục" và chọn tệp sao lưu đã lưu trước đó, rồi chọn Gộp dữ liệu hoặc Thay thế.',
      'Để học không cần kết nối mạng, nhấn nút "Cài đặt ứng dụng" (nếu trình duyệt hỗ trợ) để đưa Học Viện Hình Học Smart ra màn hình chính như một ứng dụng độc lập.',
    ],
    tip: 'Nên xuất một tệp sao lưu định kỳ mỗi khi hoàn thành nhiều cấp độ hoặc trước khi xóa dữ liệu trình duyệt.',
    illustration: 'backup',
    actionLabel: 'Mở Sao lưu & Cài đặt',
    actionType: 'page',
    actionTarget: 'settings',
  },
];

const GuideIllustration: React.FC<{ kind: GuideIllustrationId }> = ({ kind }) => {
  switch (kind) {
    case 'interface':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="10" y="12" width="300" height="28" rx="7" fill="#FFFFFF" stroke="#CBD5E1" />
          <circle cx="24" cy="26" r="6" fill="#0F766E" />
          <rect x="38" y="21" width="44" height="10" rx="4" fill="#0F766E" opacity="0.2" />
          <rect x="92" y="21" width="36" height="10" rx="4" fill="#0F766E" />
          <rect x="134" y="21" width="48" height="10" rx="4" fill="#CBD5E1" />
          <rect x="188" y="21" width="34" height="10" rx="4" fill="#CBD5E1" />
          <rect x="228" y="21" width="38" height="10" rx="4" fill="#CBD5E1" />
          <rect x="272" y="21" width="30" height="10" rx="4" fill="#94A3B8" />
          <rect x="14" y="52" width="182" height="84" rx="10" fill="#FFFFFF" stroke="#CBD5E1" />
          <circle cx="80" cy="96" r="24" fill="none" stroke="#0F766E" strokeWidth="1.8" strokeDasharray="4 3" />
          <circle cx="112" cy="96" r="24" fill="none" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="4 3" />
          <polygon points="80,96 112,96 96,68" fill="#0F766E" fillOpacity="0.12" stroke="#0F766E" strokeWidth="2" />
          <rect x="206" y="52" width="100" height="38" rx="8" fill="#F0FDFA" stroke="#99F6E4" />
          <rect x="216" y="62" width="60" height="7" rx="3" fill="#0F766E" opacity="0.7" />
          <rect x="216" y="75" width="76" height="6" rx="3" fill="#64748B" opacity="0.4" />
          <rect x="206" y="98" width="100" height="38" rx="8" fill="#FFFBEB" stroke="#FDE68A" />
          <rect x="216" y="108" width="54" height="7" rx="3" fill="#D97706" opacity="0.8" />
          <rect x="216" y="121" width="72" height="6" rx="3" fill="#64748B" opacity="0.4" />
        </svg>
      );
    case 'straightedge':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <line x1="36" y1="112" x2="284" y2="42" stroke="#0F766E" strokeWidth="2.5" />
          <g transform="rotate(-15.8 160 77)">
            <rect x="44" y="80" width="232" height="24" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
            <text x="160" y="96" textAnchor="middle" fontSize="10" fontWeight="700" fill="#92400E">THƯỚC THẲNG KHÔNG CHIA ĐỘ</text>
          </g>
          <circle cx="88" cy="97" r="6" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="232" cy="57" r="6" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
          <text x="76" y="85" fontSize="13" fontWeight="700" fill="#0F172A">A</text>
          <text x="236" y="47" fontSize="13" fontWeight="700" fill="#0F172A">B</text>
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <circle cx="135" cy="82" r="46" fill="none" stroke="#0284C7" strokeWidth="2.2" />
          <line x1="135" y1="82" x2="181" y2="82" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="4 3" />
          <line x1="158" y1="22" x2="135" y2="82" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <line x1="158" y1="22" x2="181" y2="82" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <circle cx="158" cy="22" r="6" fill="#0F766E" />
          <circle cx="135" cy="82" r="5" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="181" cy="82" r="5" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
          <text x="120" y="96" fontSize="12" fontWeight="700" fill="#0F172A">O (Tâm)</text>
          <text x="188" y="86" fontSize="12" fontWeight="700" fill="#0F172A">A (Bán kính)</text>
        </svg>
      );
    case 'points':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <circle cx="128" cy="80" r="44" fill="none" stroke="#0284C7" strokeWidth="2" />
          <line x1="48" y1="116" x2="266" y2="40" stroke="#0F766E" strokeWidth="2" />
          <circle cx="164" cy="55" r="12" fill="#D97706" fillOpacity="0.18" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="164" cy="55" r="5.5" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="91" cy="101" r="5" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
          <text x="178" y="48" fontSize="11" fontWeight="700" fill="#B45309">Giao điểm (bắt dính)</text>
        </svg>
      );
    case 'first-challenge':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <circle cx="125" cy="98" r="70" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx="195" cy="98" r="70" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" />
          <polygon points="125,98 195,98 160,37" fill="#0F766E" fillOpacity="0.12" stroke="#0F766E" strokeWidth="2.4" />
          <circle cx="125" cy="98" r="5" fill="#0F766E" />
          <circle cx="195" cy="98" r="5" fill="#0F766E" />
          <circle cx="160" cy="37" r="5.5" fill="#D97706" />
          <text x="111" y="114" fontSize="12" fontWeight="700" fill="#0F172A">A</text>
          <text x="200" y="114" fontSize="12" fontWeight="700" fill="#0F172A">B</text>
          <text x="166" y="34" fontSize="12" fontWeight="700" fill="#B45309">C</text>
        </svg>
      );
    case 'verify':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="22" y="20" width="122" height="32" rx="9" fill="#0F766E" />
          <text x="83" y="40" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">Kiểm chứng</text>
          <line x1="40" y1="110" x2="150" y2="110" stroke="#0F766E" strokeWidth="2.5" />
          <line x1="95" y1="68" x2="95" y2="132" stroke="#0284C7" strokeWidth="2" />
          <path d="M156 105 C170 96, 178 96, 190 105" fill="none" stroke="#D97706" strokeWidth="1.8" strokeDasharray="3 2" />
          <rect x="196" y="24" width="104" height="104" rx="10" fill="#ECFDF5" stroke="#6EE7B7" />
          <text x="248" y="48" textAnchor="middle" fontSize="11" fontWeight="700" fill="#065F46">Đánh giá 3 sao</text>
          <text x="208" y="72" fontSize="11" fontWeight="600" fill="#047857">★1 Chính xác</text>
          <text x="208" y="92" fontSize="11" fontWeight="600" fill="#047857">★2 Tối ưu L</text>
          <text x="208" y="112" fontSize="11" fontWeight="600" fill="#047857">★3 Tối ưu E</text>
        </svg>
      );
    case 'hints':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="18" y="18" width="136" height="30" rx="7" fill="#FFFBEB" stroke="#FCD34D" />
          <text x="28" y="37" fontSize="10.5" fontWeight="700" fill="#92400E">Mức 1 – Định hướng</text>
          <rect x="18" y="56" width="136" height="30" rx="7" fill="#FFFBEB" stroke="#FCD34D" />
          <text x="28" y="75" fontSize="10.5" fontWeight="700" fill="#92400E">Mức 2 – Phương pháp</text>
          <rect x="18" y="94" width="136" height="30" rx="7" fill="#FFFBEB" stroke="#FCD34D" />
          <text x="28" y="113" fontSize="10.5" fontWeight="700" fill="#92400E">Mức 3 – Thao tác cụ thể</text>
          <rect x="168" y="18" width="134" height="106" rx="10" fill="#FFFFFF" stroke="#CBD5E1" />
          <text x="235" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F766E">Lời giải từng bước</text>
          <rect x="184" y="58" width="102" height="8" rx="4" fill="#CCFBF1" />
          <rect x="184" y="58" width="62" height="8" rx="4" fill="#0F766E" />
          <rect x="184" y="82" width="44" height="24" rx="6" fill="#0F766E" />
          <text x="206" y="98" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">Bắt đầu</text>
          <rect x="234" y="82" width="52" height="24" rx="6" fill="#F1F5F9" stroke="#CBD5E1" />
          <text x="260" y="98" textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">Bước tiếp</text>
        </svg>
      );
    case 'lab':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="14" y="14" width="70" height="122" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
          <rect x="22" y="24" width="54" height="16" rx="4" fill="#0F766E" />
          <rect x="22" y="46" width="54" height="14" rx="4" fill="#E2E8F0" />
          <rect x="22" y="66" width="54" height="14" rx="4" fill="#E2E8F0" />
          <rect x="22" y="86" width="54" height="14" rx="4" fill="#E2E8F0" />
          <rect x="22" y="106" width="54" height="14" rx="4" fill="#E2E8F0" />
          <rect x="94" y="14" width="212" height="122" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
          <line x1="94" y1="75" x2="306" y2="75" stroke="#E2E8F0" strokeWidth="1" />
          <line x1="200" y1="14" x2="200" y2="136" stroke="#E2E8F0" strokeWidth="1" />
          <polygon points="150,112 252,112 204,42" fill="#0284C7" fillOpacity="0.1" stroke="#0284C7" strokeWidth="2" />
          <circle cx="201" cy="84" r="28" fill="none" stroke="#0F766E" strokeWidth="1.8" strokeDasharray="4 3" />
          <text x="195" y="128" fontSize="10" fontWeight="700" fill="#0F766E">AB = 6,40</text>
        </svg>
      );
    case 'classroom':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="18" y="16" width="180" height="118" rx="10" fill="#0F172A" />
          <text x="108" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5EEAD4">TRÌNH CHIẾU LỚP HỌC</text>
          <polygon points="62,110 154,110 108,58" fill="none" stroke="#38BDF8" strokeWidth="2.2" />
          <line x1="108" y1="58" x2="108" y2="110" stroke="#FBBF24" strokeWidth="1.8" strokeDasharray="4 3" />
          <rect x="210" y="16" width="92" height="54" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
          <text x="256" y="40" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F766E">Xem trước</text>
          <text x="256" y="56" textAnchor="middle" fontSize="10" fill="#475569">180 thử thách</text>
          <rect x="210" y="80" width="92" height="54" rx="8" fill="#FFFBEB" stroke="#FDE68A" />
          <text x="256" y="104" textAnchor="middle" fontSize="10" fontWeight="700" fill="#B45309">Đấu trường</text>
          <text x="256" y="120" textAnchor="middle" fontSize="10" fill="#78350F">Nhóm · Lớp học</text>
        </svg>
      );
    case 'achievements':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="18" y="20" width="130" height="110" rx="10" fill="#FFFFFF" stroke="#CBD5E1" />
          <text x="32" y="44" fontSize="11" fontWeight="700" fill="#0F766E">Tổng sao: 360 / 540</text>
          <rect x="32" y="54" width="102" height="8" rx="4" fill="#E2E8F0" />
          <rect x="32" y="54" width="68" height="8" rx="4" fill="#F59E0B" />
          <circle cx="48" cy="96" r="14" fill="#FEF3C7" stroke="#F59E0B" />
          <circle cx="84" cy="96" r="14" fill="#CCFBF1" stroke="#0F766E" />
          <circle cx="120" cy="96" r="14" fill="#E0F2FE" stroke="#0284C7" />
          <rect x="162" y="20" width="140" height="110" rx="8" fill="#FCFDFB" stroke="#0F766E" strokeWidth="2.5" />
          <text x="232" y="48" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0F766E">GIẤY CHỨNG NHẬN</text>
          <line x1="186" y1="68" x2="278" y2="68" stroke="#F59E0B" strokeWidth="2" />
          <text x="232" y="88" textAnchor="middle" fontSize="10" fill="#475569">Khổ A4 · Tải PNG / In PDF</text>
        </svg>
      );
    case 'export':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="24" y="24" width="132" height="102" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
          <circle cx="90" cy="75" r="32" fill="none" stroke="#0F766E" strokeWidth="2" />
          <polygon points="90,43 118,91 62,91" fill="#0F766E" fillOpacity="0.1" stroke="#0284C7" strokeWidth="2" />
          <path d="M164 75 L192 75" stroke="#0F766E" strokeWidth="2.5" />
          <polygon points="190,69 200,75 190,81" fill="#0F766E" />
          <rect x="208" y="30" width="88" height="38" rx="8" fill="#0F766E" />
          <text x="252" y="53" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFFFF">Xuất PNG</text>
          <rect x="208" y="82" width="88" height="38" rx="8" fill="#FFFFFF" stroke="#0F766E" strokeWidth="1.6" />
          <text x="252" y="105" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F766E">Xuất SVG</text>
        </svg>
      );
    case 'backup':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="22" y="26" width="124" height="98" rx="10" fill="#FFFFFF" stroke="#CBD5E1" />
          <text x="84" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F766E">Lưu trên thiết bị</text>
          <rect x="38" y="72" width="92" height="28" rx="7" fill="#0F766E" />
          <text x="84" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">Xuất tệp sao lưu</text>
          <rect x="174" y="26" width="124" height="98" rx="10" fill="#F0FDFA" stroke="#99F6E4" />
          <text x="236" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F766E">Dùng ngoại tuyến</text>
          <rect x="190" y="72" width="92" height="28" rx="7" fill="#FFFFFF" stroke="#0F766E" />
          <text x="236" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F766E">Khôi phục dữ liệu</text>
        </svg>
      );
  }
};

const GROUP_ICONS: React.FC<{ num: number }> = ({ num }) => {
  const cls = 'w-5 h-5 text-teal-700 dark:text-teal-400';
  switch (num) {
    case 1:
      return <BookOpen className={cls} />;
    case 2:
      return <Ruler className={cls} />;
    case 3:
      return <Compass className={cls} />;
    case 4:
      return <MapPin className={cls} />;
    case 5:
      return <Target className={cls} />;
    case 6:
      return <ShieldCheck className={cls} />;
    case 7:
      return <Lightbulb className={cls} />;
    case 8:
      return <PenTool className={cls} />;
    case 9:
      return <GraduationCap className={cls} />;
    case 10:
      return <Award className={cls} />;
    case 11:
      return <Download className={cls} />;
    default:
      return <HardDrive className={cls} />;
  }
};

export const GuidePage: React.FC = () => {
  const { setPage, openChallenge, setTourOpen } = useApp();
  const [selectedId, setSelectedId] = useState<string>('all');

  const visibleGroups =
    selectedId === 'all'
      ? GUIDE_GROUPS
      : GUIDE_GROUPS.filter((g) => g.id === selectedId);

  const handleAction = (group: GuideGroup) => {
    if (group.actionType === 'challenge') {
      openChallenge(group.actionTarget);
      return;
    }
    if (group.actionType === 'tour') {
      setTourOpen(true);
      return;
    }
    setPage(group.actionTarget as Parameters<typeof setPage>[0]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-400 mb-1.5">
            <HelpCircle className="w-4 h-4" />
            Cẩm nang sử dụng dành cho học sinh và giáo viên
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Hướng dẫn sử dụng Học Viện Hình Học Smart
          </h1>
          <p className="text-[15px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
            12 phần hướng dẫn cụ thể từng bước, viết ngắn gọn dễ hiểu để người mới có thể làm quen, dựng hình bằng thước thẳng và compa, kiểm chứng kết quả và tổ chức học tập hiệu quả.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setTourOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[15px] font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Compass className="w-4 h-4 text-teal-700" />
            Mở hướng dẫn tương tác
          </button>
          <button
            type="button"
            onClick={() => openChallenge('L01_C01')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800"
          >
            <Play className="w-4 h-4 fill-current" />
            Bắt đầu thử thách đầu tiên
          </button>
        </div>
      </div>

      {/* Quick index of 12 groups */}
      <nav
        aria-label="Mục lục 12 phần hướng dẫn"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Mục lục nhanh (12 chủ đề hướng dẫn)
          </h2>
          {selectedId !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedId('all')}
              className="text-[15px] font-semibold text-teal-700 dark:text-teal-400 hover:underline"
            >
              Xem tất cả 12 phần
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {GUIDE_GROUPS.map((g) => {
            const active = selectedId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedId(active ? 'all' : g.id)}
                className={`flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border text-[15px] font-medium transition-colors ${
                  active
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 font-mono-tabular ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200'
                  }`}
                >
                  {g.number}
                </span>
                <span className="truncate">{g.title}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 12 Guide Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleGroups.map((group) => (
          <article
            key={group.id}
            id={group.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-xs"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900 flex items-center justify-center shrink-0">
                  <GroupIconWrapper num={group.number} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Phần {group.number} / 12
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {group.title}
                  </h3>
                </div>
              </div>

              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {group.summary}
              </p>

              {/* Visual illustration */}
              <GuideIllustration kind={group.illustration} />

              {/* Step-by-step instructions */}
              <ol className="space-y-2.5 text-[15px] text-slate-700 dark:text-slate-200">
                {group.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono-tabular">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {/* Practical tip */}
              <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 px-3.5 py-2.5 text-[15px] text-amber-950 dark:text-amber-200 leading-relaxed">
                <strong className="font-semibold">Mẹo thực hành: </strong>
                {group.tip}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => handleAction(group)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 text-[15px] font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
              >
                {group.actionLabel}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const GroupIconWrapper: React.FC<{ num: number }> = ({ num }) => <GROUP_ICONS num={num} />;
